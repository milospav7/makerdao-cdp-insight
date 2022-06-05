import { bytesToString } from "@defisaver/tokens/esm/utils";
import { useCallback, useMemo, useRef } from "react";
import Web3 from "web3";
import Contract from "../../contracts/VaultInfo/Contract";
import { CdpServiceResponse, StatusCodes } from "../utils";
import { CollateralType, TQueryParams } from "./types";

const INVALID_STATE = "0x0000000000000000000000000000000000000000";

// With custom http providers it would make much more sense to use it as a hook(some async operations would be triggered), but either way I will leave it as it is in order to keep that hook-based programing style
// I will not make provider checking (if eth !== undefined) since it is responsibility of upper autentication level
export const useWeb3 = () => {
  const web3 = useMemo(() => new Web3(window.ethereum as any), []);
  return web3;
};

export const useCdpService = () => {
  let timestampOfLastExec = useRef(0);
  const web3 = useWeb3();
  const { abi, addres } = Contract;

  const contract = useMemo(
    () => new web3.eth.Contract(abi, addres),
    [abi, addres, web3.eth.Contract]
  );

  const isNonexistingCdp = useCallback(
    (cdp: any) =>
      cdp.owner === INVALID_STATE &&
      cdp.ilk === INVALID_STATE &&
      cdp.userAddr === INVALID_STATE,
    []
  );

  const enrichCdp = useCallback(
    (id: number, cdp: any) => ({
      ...cdp,
      id,
      type: bytesToString(cdp.ilk),
      nonexistingCdp: isNonexistingCdp(cdp),
    }),
    [isNonexistingCdp]
  );

  const isTargetType = useCallback(
    (ilk: string, expectedType: CollateralType) => {
      const encoded = bytesToString(ilk);
      return encoded === expectedType;
    },
    []
  );

  const getCdp = useCallback(
    async (id: number) => {
      try {
        const result = await contract.methods.getCdpInfo(id).call();
        const cdp = enrichCdp(id, result);
        return new CdpServiceResponse<any>(true, StatusCodes.OK, cdp);
      } catch (error) {
        return new CdpServiceResponse<any>(
          false,
          StatusCodes.Exception,
          null,
          error
        );
      }
    },
    [contract.methods, enrichCdp]
  );

  const unprotectedGetCdp = useCallback(
    async (id: number) => {
      const result = await contract.methods.getCdpInfo(id).call();
      return enrichCdp(id, result);
    },
    [contract.methods, enrichCdp]
  );

  const isThisMostRecentExecution = useCallback(
    (executionTimestamp: number) =>
      timestampOfLastExec.current === executionTimestamp,
    []
  );

  const getCdps = useCallback(
    async (
      queryParms: TQueryParams,
      onProgressUpdate?: (progress: number) => void
    ) => {
      const currentTimestamp = new Date().getTime();
      timestampOfLastExec.current = currentTimestamp;

      try {
        const { id, type } = queryParms;
        const parallelismDegree = 5;
        const maxOffset = parallelismDegree * 30;
        const expectedListSize = 20;

        let retreivedCdps: any[] = [];
        let topNotReached = true;
        let bottomNotReached = true;
        let maxOffsetNotReached = true;
        let currentTopId = id;
        let currentBottomId = id - 1;

        while (
          retreivedCdps.length < expectedListSize &&
          (topNotReached || bottomNotReached) &&
          maxOffsetNotReached &&
          isThisMostRecentExecution(currentTimestamp)
        ) {
          if (bottomNotReached) {
            const chunkSizeShouldBeReduced =
              currentBottomId < parallelismDegree; // Check to prevent hitting through 0 id
            const modifiedDegree = chunkSizeShouldBeReduced
              ? currentBottomId
              : parallelismDegree;

            const bottomIds = [...Array(modifiedDegree).keys()].map(
              // eslint-disable-next-line no-loop-func
              (x) => currentBottomId - x
            );

            let bottomIdsResponse = await Promise.all(
              bottomIds.map((id) => unprotectedGetCdp(id))
            );

            for (const cdp of bottomIdsResponse) {
              if (cdp.nonexistingCdp) {
                bottomNotReached = false;
              } else {
                const lastBottomIdProcessed = cdp.id === 1;
                const typeMatch = isTargetType(cdp.ilk, type);

                if (lastBottomIdProcessed) bottomNotReached = false;

                if (typeMatch && retreivedCdps.length < expectedListSize) {
                  retreivedCdps.push(cdp);
                }
              }
            }
            currentBottomId = currentBottomId - modifiedDegree;
            if (onProgressUpdate && retreivedCdps.length)
              onProgressUpdate(
                Math.ceil((retreivedCdps.length / expectedListSize) * 100)
              );
          }

          if (topNotReached) {
            const topIds = [...Array(parallelismDegree).keys()].map(
              // eslint-disable-next-line no-loop-func
              (x) => currentTopId + x
            );

            let topIdsResponse = await Promise.all(
              topIds.map((id) => unprotectedGetCdp(id))
            );

            for (const cdp of topIdsResponse) {
              if (cdp.nonexistingCdp) {
                topNotReached = false;
              } else {
                const typeMatch = isTargetType(cdp.ilk, type);

                if (typeMatch && retreivedCdps.length < expectedListSize) {
                  retreivedCdps.push(cdp);
                }
              }
            }
            currentTopId = currentTopId + parallelismDegree;
            if (onProgressUpdate && retreivedCdps.length)
              onProgressUpdate(
                Math.ceil((retreivedCdps.length / expectedListSize) * 100)
              );
          }

          const offsetReached =
            currentBottomId - id > maxOffset || currentTopId - id > maxOffset;

          if (offsetReached && retreivedCdps.length < 0.5 * expectedListSize)
            maxOffsetNotReached = false;
        }

        const executionAborted = !isThisMostRecentExecution(currentTimestamp);
        if (executionAborted)
          return new CdpServiceResponse<any[]>(false, StatusCodes.Aborted, []);

        if (maxOffsetNotReached)
          return new CdpServiceResponse<any[]>(
            true,
            StatusCodes.OK,
            retreivedCdps
          );

        return new CdpServiceResponse<any[]>(
          false,
          StatusCodes.AbortedDueMaxOffset,
          retreivedCdps
        );
      } catch (error) {
        const code = isThisMostRecentExecution(currentTimestamp)
          ? StatusCodes.Exception
          : StatusCodes.Aborted;
        return new CdpServiceResponse<any[]>(false, code, [], error);
      }
    },
    [isTargetType, isThisMostRecentExecution, unprotectedGetCdp]
  );

  return { getCdp, getCdps };
};

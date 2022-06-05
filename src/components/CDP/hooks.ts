import { bytesToString } from "@defisaver/tokens/esm/utils";
import { useCallback, useMemo, useRef } from "react";
import Web3 from "web3";
import Contract from "../../contracts/VaultInfo/Contract";
import { RpcResponse, StatusCodes } from "../utils";
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
        return new RpcResponse<any>(true, StatusCodes.OK, cdp);
      } catch (error) {
        return new RpcResponse<any>(false, StatusCodes.Exception, null, error);
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
        const expectedListSize = 20;

        let retreivedCdps: any[] = [];
        let topNotReached = true;
        let bottomNotReached = true;
        let currentTopId = id;
        let currentBottomId = id - 1;

        while (
          retreivedCdps.length < expectedListSize &&
          (topNotReached || bottomNotReached) &&
          isThisMostRecentExecution(currentTimestamp)
        ) {
          console.log(queryParms.id);
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
              const lastBottomIdProcessed = cdp.id === 1;

              if (cdp.nonexistingCdp) {
                bottomNotReached = false;
              } else {
                const typeMatch = isTargetType(cdp.ilk, type);
                if (lastBottomIdProcessed) bottomNotReached = false;

                if (typeMatch && retreivedCdps.length < 20) {
                  retreivedCdps.push(cdp);
                  currentBottomId = cdp.id - 1;

                  if (onProgressUpdate)
                    onProgressUpdate(
                      Math.ceil((retreivedCdps.length / 20) * 100)
                    );
                }
              }
            }
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

                if (typeMatch && retreivedCdps.length < 20) {
                  retreivedCdps.push(cdp);
                  currentTopId = cdp.id + 1;

                  if (onProgressUpdate)
                    onProgressUpdate(
                      Math.ceil((retreivedCdps.length / 20) * 100)
                    );
                }
              }
            }
          }
        }
        console.log(retreivedCdps);
        if (isThisMostRecentExecution(currentTimestamp))
          return new RpcResponse<any[]>(true, StatusCodes.OK, retreivedCdps);
        else return new RpcResponse<any[]>(false, StatusCodes.Aborted, []);
      } catch (error) {
        return new RpcResponse<any[]>(false, StatusCodes.Exception, [], error);
      }
    },
    [isTargetType, isThisMostRecentExecution, unprotectedGetCdp]
  );

  return { getCdp, getCdps };
};

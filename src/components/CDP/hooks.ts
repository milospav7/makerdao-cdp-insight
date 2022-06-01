import { bytesToString } from "@defisaver/tokens/esm/utils";
import { useCallback, useMemo } from "react";
import Web3 from "web3";
import Contract from "../../contracts/VaultInfo/Contract";
import { CollateralType, TQueryParams, TServiceOptions } from "./types";

// With custom http providers it would make much more sense to use it as a hook(some async operations would be triggered), but either way I will leave it as it is in order to keep that hook-based programing style
// I will not make provider checking (if eth !== undefined) since it is responsibility of upper autentication level
export const useWeb3 = () => {
  const web3 = useMemo(() => new Web3(window.ethereum as any), []);
  return web3;
};

export const useCdpService = (options: TServiceOptions) => {
  const web3 = useWeb3();

  const enrichCdp = useCallback(
    (id: number, cdp: any) => ({
      ...cdp,
      id,
      type: bytesToString(cdp.ilk),
    }),
    []
  );

  const isTargetType = useCallback(
    (ilk: string, expectedType: CollateralType) => {
      const encoded = bytesToString(ilk);
      return encoded === expectedType;
    },
    []
  );

  const isNonexistingCdp = useCallback(
    (cdp: any) => cdp.owner === "0x0000000000000000000000000000000000000000",
    []
  );

  const getCdp = useCallback(
    async (id: number) => {
      try {
        const { abi, addres } = Contract;
        const contract = new web3.eth.Contract(abi, addres);
        const result = await contract.methods.getCdpInfo(id).call();
        return enrichCdp(id, result);
      } catch (error) {
        options.onError(error);
      }
    },
    [enrichCdp, options, web3.eth.Contract]
  );

  const getCdps = useCallback(
    async (queryParms: TQueryParams) => {
      try {
        const { id, type } = queryParms;
        console.log(type);
        const parallelismDegree = 5;
        const expectedListSize = 20;

        let retreivedCdps: any[] = [];
        let topNotReached = true;
        let bottomNotReached = true;
        let currentTopId = id;
        let currentBottomId = id - 1;

        while (
          retreivedCdps.length < expectedListSize &&
          (topNotReached || bottomNotReached)
        ) {
          console.log(topNotReached, bottomNotReached);
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
              bottomIds.map((id) => getCdp(id))
            );

            for (const cdp of bottomIdsResponse) {
              const nonExistingCdp = isNonexistingCdp(cdp);
              const lastBottomIdProcessed = cdp.id === 1;

              if (nonExistingCdp || lastBottomIdProcessed) {
                bottomNotReached = false;
              } else {
                const typeMatch = isTargetType(cdp.ilk, type);
                if (typeMatch && retreivedCdps.length < 20) {
                  retreivedCdps.push(cdp);
                  currentBottomId = cdp.id - 1;
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
              topIds.map((id) => getCdp(id))
            );

            for (const cdp of topIdsResponse) {
              const nonExistingCdp = isNonexistingCdp(cdp);

              if (nonExistingCdp) {
                topNotReached = false;
              }
              {
                const typeMatch = isTargetType(cdp.ilk, type);
                if (typeMatch && retreivedCdps.length < 20) {
                  retreivedCdps.push(cdp);
                  currentTopId = cdp.id + 1;
                }
              }
            }
          }
        }

        console.log("length", retreivedCdps);
        console.log(currentBottomId, currentTopId);
        return retreivedCdps;
      } catch (error) {
        options.onError(error);
        return [];
      }
    },
    [getCdp, isNonexistingCdp, isTargetType, options]
  );

  return { getCdp, getCdps };
};

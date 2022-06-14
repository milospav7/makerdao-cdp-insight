import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageLoader from "../shared/PageLoader";
import SignMessageButton from "../shared/SignMessageButton";
import { formatNumber, StatusCodes } from "./utils";
import { useCdpService } from "./hooks";
import { CollateralType, TCollateralPricePerType } from "./types";

const PricePerAssetType: TCollateralPricePerType = {
  "ETH-A": 1238,
  "WBTC-A": 24104,
  "USDC-A": 1,
}; // In dollars

const errorHandler = (error: any) => {
  // Some error handling...
  console.error(error);
  toast.error(
    "There was an error while trying to load CDP data. Reload page in order to try again.",
    { autoClose: 8000 }
  );
};

const CdpDetails = () => {
  const { cdpId } = useParams();
  const { getCdp } = useCdpService();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState<string[]>([]);
  const [cdp, setCdp] = useState<any>({});

  useEffect(() => {
    setLoading(true);
    const parsedId = Number(cdpId);
    const idIsInvalid = !Number.isInteger(parsedId) || parsedId <= 0;

    if (idIsInvalid) {
      navigate("/resource-not-found", { replace: true });
      return;
    }

    async function loadCdp() {
      const response = await getCdp(parsedId);

      if (response.isSuccess) {
        const cdp = response.data;
        if (cdp.nonexistingCdp)
          navigate("/resource-not-found", { replace: true });
        else {
          setCdp(cdp);
          setLoading(false);
        }
      } else if (response.code === StatusCodes.Exception)
        errorHandler(response.error);
    }

    loadCdp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdpId]);

  if (loading) return <PageLoader />;

  const updateSignatures = (signature: string) =>
    setSignatures((p) => [...p, signature]);

  // The minimum required collateralization level - for example, a Vault with a 150% Liquidation Ratio will require a minimum $1.50 of collateral value for every $1 of Dai generated
  const getLiquidationRatio = () => {
    if (cdp.type === "ETH-A" || cdp.type === "WBTC-A") return 145;
    if (cdp.type === "USDC-A") return 101;
    return 0;
  };

  // Liquidation Price = (Generated Dai * Liquidation Ratio) / (Amount of Collateral)
  // https://www.reddit.com/r/MakerDAO/comments/9gs6sc/trying_to_figure_out_liquidation_price/
  const calculateLiqudationPrice = () => {
    if (cdp.collateral > 0) {
      const liqRatio = getLiquidationRatio();
      const liqudationPrice = (cdp.debt * liqRatio) / (100 * cdp.collateral); // Missing PETH/ETH param?
      return formatNumber(liqudationPrice);
    }

    return 0;
  };

  // Collateral ratio is the ratio between the Dollar value of the collateral in your position and its debt in LUSD
  const calculateCollateralRatio = () => {
    if (cdp.collateral > 0 && cdp.debt > 0) {
      const currentPrice = PricePerAssetType[cdp.type as CollateralType];
      const collateralValue: number = currentPrice * cdp.collateral;
      const ratio = ((collateralValue / cdp.debt) * 100).toFixed(2);
      return formatNumber(ratio);
    }

    return 0;
  };

  const calculateMaxDebt = () => {
    if (cdp.collateral > 0 && cdp.debt > 0) {
      const liqRatio = getLiquidationRatio();
      const currentPrice = PricePerAssetType[cdp.type as CollateralType];
      const collateralValue: number = currentPrice * cdp.collateral;
      const maxDebt = ((collateralValue / liqRatio) * 100).toFixed(2);
      return formatNumber(maxDebt);
    }

    return 0;
  };

  return (
    <div className="bg-dark-overlay px-3 h-100">
      <div className="d-flex flex-row flex-wrap align-items-center justify-content-between">
        <div className="bg-light-overlay rounded px-3 small py-2">
          <p className="mb-0 fw-bold">
            COLL. RATIO: <b>{calculateCollateralRatio()} %</b>
          </p>
        </div>
        <div className="bg-light-overlay rounded px-3 small py-2">
          <p className="mb-0 fw-bold">
            LIQ. RATIO: <b>{getLiquidationRatio()} %</b>
          </p>
        </div>
        <div className="bg-light-overlay rounded px-3 small py-2">
          <p className="mb-0 fw-bold">
            LIQ. PRICE: <b>{calculateLiqudationPrice()} $</b>
          </p>
        </div>
        <div className="bg-light-overlay rounded px-3 small py-2">
          <p className="mb-0 fw-bold">
            MAX DEBT: <b>{calculateMaxDebt()} DAI</b>
          </p>
        </div>
      </div>
      <hr className="my-4" />
      <div>
        <h5 className="mb-3 fw-bold text">CDP INFORMATION</h5>

        <div className="ps-2">
          <p>
            Id: <b>{cdp.id}</b>
          </p>
          <p>
            Current {cdp.type} price:
            <b>
              {formatNumber(PricePerAssetType[cdp.type as CollateralType])} $
            </b>
          </p>
          <p>
            Collateral:
            <b>
              {formatNumber(cdp.collateral)} {cdp.type}
            </b>
          </p>
          <p>
            Debt: <b>{formatNumber(cdp.debt)} DAI</b>
          </p>
          <p>
            Address: <b>{cdp.userAddr}</b>
          </p>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex-fill ">
        <div>
          <div className="d-flex flex-row align-items-center mb-3">
            <h5 className="fw-bold">SIGNATURES</h5>
          </div>
          <div className="ps-2 mb-3">
            {signatures.length > 0 ? (
              signatures.map((s, i) => (
                <p key={i}>
                  {i + 1}) {s}
                </p>
              ))
            ) : (
              <p>
                <i>No messages were signed.</i>
              </p>
            )}
          </div>
          <SignMessageButton
            message="Ovo je moj CDP"
            onMessageSigned={updateSignatures}
            onSignError={toast.error}
          />
        </div>
      </div>
    </div>
  );
};

export default CdpDetails;

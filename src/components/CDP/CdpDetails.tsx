import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageLoader from "../shared/PageLoader";
import SignMessageButton from "../shared/SignMessageButton";
import { useCdpService } from "./hooks";

const errorHandler = (error: any) => {
  // Some error handling...
  console.error(error);
  toast.error(
    "There was an error while trying to load CDP data. Reload page in order to try again.",
    { autoClose: 7000 }
  );
};

const serviceOptions = { onError: errorHandler };

const CdpDetails = () => {
  const { cdpId } = useParams();
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState<string[]>([]);
  const [cdp, setCdp] = useState<any>({});
  const { getCdp } = useCdpService(serviceOptions);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const parsedId = Number(cdpId);
    const idIsInvalid = !Number.isInteger(parsedId) || parsedId <= 0;

    if (idIsInvalid) {
      navigate("/resource-not-found", { replace: true });
      return;
    }

    async function loadCdp() {
      const cdp = await getCdp(parsedId);

      if (cdp.nonexistingCdp)
        navigate("/resource-not-found", { replace: true });
      else setCdp(cdp);

      setLoading(false);
    }

    loadCdp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdpId]);

  const updateSignatures = (signature: string) =>
    setSignatures((p) => [...p, signature]);

  const getLiquidationRatio = () => {
    if (cdp.type === "ETH-A" || cdp.type === "WBTC-A") return "145%";
    if (cdp.type === "USDC-A") return "101%";
    return "";
  };

  if (loading) return <PageLoader />;

  return (
    <div className="bg-dark-overlay px-3 h-100">
      <div className="d-flex flex-row flex-wrap align-items-center justify-content-between">
        <div className="bg-light-overlay rounded px-3 small py-1">
          <p className="mb-0">
            Collateralization Ratio: <b>180%</b>
          </p>
        </div>
        <div className="bg-light-overlay rounded px-3 small py-1">
          <p className="mb-0">
            Liqudation Ratio: <b>{getLiquidationRatio()}</b>
          </p>
        </div>
        <div className="bg-light-overlay rounded px-3 small py-1">
          <p className="mb-0">
            Max Collateral locked: <b>{cdp.collateral}</b>
          </p>
        </div>
        <div className="bg-light-overlay rounded px-3 small py-1">
          <p className="mb-0">
            Max DAI Debt: <b>{cdp.collateral}</b>
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
            Type: <b>{cdp.type}</b>
          </p>
          <p>
            Collateral: <b>{cdp.collateral}</b>
          </p>
          <p>
            Debt: <b>{cdp.debt} DAI</b>
          </p>
          <p>
            Address: <b>{cdp.userAddr}</b>
          </p>
          <p>
            Owner: <b>{cdp.owner}</b>
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

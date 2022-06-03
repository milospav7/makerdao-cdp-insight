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

const CdpDetails = () => {
  const { cdpId } = useParams();
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState<string[]>([]);
  const [cdp, setCdp] = useState<any>({});
  const { getCdp } = useCdpService({ onError: errorHandler });
  const navigate = useNavigate();

  useEffect(() => {
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
      else {
        setCdp(cdp);
        setLoading(false);
      }
    }

    loadCdp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdpId]);

  const updateSignatures = (signature: string) =>
    setSignatures((p) => [...p, signature]);

  if (loading) return <PageLoader />;

  return (
    <div className="bg-dark-overlay p-3 h-100">
      <div>
        <div className="">
          <h5 className="mb-3 fw-bold">
            <u>CDP INFORMATION</u>
          </h5>
          <div className="ps-2">
            <p>
              Id: <b>{cdp.id}</b>
            </p>
            <p>
              Type: <b>{cdp.type}</b>
            </p>
            <p>
              Coll. Ratio: <b>{cdp.collateral}</b>
            </p>
            <p>
              Debt: <b>{cdp.debt}</b>
            </p>
            <p>
              Address: <b>{cdp.userAddr}</b>
            </p>
            <p>
              Owner: <b>{cdp.owner}</b>
            </p>
          </div>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex-fill ">
        <div>
          <div className="d-flex flex-row align-items-center mb-3">
            <h5 className="fw-bold">
              <u>SIGNATURES</u>
            </h5>
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

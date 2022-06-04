import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./Auth/hooks";

interface IProps {
  className?: string;
}

const ReloadAppButton = ({ className = "" }: IProps) => {
  const {
    actions: { retryWalletAccess },
  } = useAuthContext();
  const navigate = useNavigate();

  const reload = () => {
    retryWalletAccess();
    navigate("/");
  };

  return (
    <div className={className}>
      <button className="btn btn-dark btn-md" onClick={reload}>
        Reload
      </button>
    </div>
  );
};

export default ReloadAppButton;

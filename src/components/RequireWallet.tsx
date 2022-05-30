import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks";

interface IProps {
  children: any;
}

const RequireWallet = ({ children }: IProps) => {
  const { accessingWallet, walletIsInstalled, error } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessingWallet && !walletIsInstalled) navigate("/wallet-missing");
    else if (error) navigate("/error");
  }, [accessingWallet, error, navigate, walletIsInstalled]);

  if (accessingWallet) return <div>Loading wallet</div>;

  return children;
};

export default RequireWallet;

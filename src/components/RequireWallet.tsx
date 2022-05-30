import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks";

interface IProps {
  children: any;
}

const RequireWallet = ({ children }: IProps) => {
  const { accessingWallet, walletIsInstalled } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessingWallet && !walletIsInstalled) navigate("/warning");
  }, [accessingWallet, navigate, walletIsInstalled]);

  if (accessingWallet) return <div>Loading wallet</div>;

  return children;
};

export default RequireWallet;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./Provider/hooks";

interface IProps {
  children: any;
}

const RequireWallet = ({ children }: IProps) => {
  const {
    wallet: { installed, accessing },
    error,
  } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessing && !installed) navigate("/wallet-missing");
    else if (error) navigate("/error");
  }, [accessing, error, navigate, installed]);

  if (accessing) return <div>Loading wallet</div>;

  return children;
};

export default RequireWallet;

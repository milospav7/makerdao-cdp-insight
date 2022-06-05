import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../Auth/hooks";
import PageLoader from "./PageLoader";

interface IProps {
  children: any;
}

const RequireWallet = ({ children }: IProps) => {
  const {
    wallet: { installed, accessing },
    error,
  } = useAuthContext();
  const navigate = useNavigate();

  const shouldRenderChildren = useMemo(
    () => !accessing && !error && installed,
    [accessing, error, installed]
  );

  useEffect(() => {
    if (!accessing && !installed) navigate("/wallet-missing");
    else if (error) navigate("/error");
  }, [accessing, error, navigate, installed]);

  if (shouldRenderChildren) return children;

  return <PageLoader />;
};

export default RequireWallet;

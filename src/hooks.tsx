import { useContext } from "react";
import { AuthContext } from "./components/AuthenticationProvider";

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  return context;
};

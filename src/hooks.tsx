import { useContext } from "react";
import { AuthContext } from "./components/AuthenticationProvider";

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error(
      "No AuthContext.Provider found when calling useAuthContext."
    );
  return context;
};

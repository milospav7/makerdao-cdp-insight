import { createContext, useContext } from "react";
import { IAuthenticationContext } from "./interfaces";

export const AuthContext = createContext<IAuthenticationContext | undefined>(
  undefined
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error(
      "No AuthContext.Provider found when calling useAuthContext."
    );

  return context;
};

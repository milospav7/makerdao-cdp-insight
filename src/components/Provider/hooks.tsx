import { createContext, useContext } from "react";
import { IAuthenticationContext, ILayoutContext } from "./interfaces";

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

export const LayoutContext = createContext<ILayoutContext | undefined>(
  undefined
);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);

  if (!context)
    throw new Error(
      "No LayoutContext.Provider found when calling useLayoutContext."
    );

  return context;
};

import { createContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

interface IProps {
  children: React.ReactNode;
}

interface IAuthenticationContext {
  accessingWallet: boolean;
  walletIsInstalled: boolean;
  walletIsConnected: boolean;
  currentAccount: any;
}

export const AuthContext = createContext<IAuthenticationContext>({
  accessingWallet: true,
  walletIsInstalled: window.ethereum !== undefined,
  walletIsConnected: false,
  currentAccount: null,
});

const AuthenticationProvider = ({ children }: IProps) => {
  const [wallet, setWallet] = useState({
    accessing: true,
    installed: window.ethereum !== undefined,
    connected: false,
    account: null,
  });

  useEffect(() => {
    console.log(window.ethereum);
    if (window.ethereum !== undefined) {
      window.ethereum.on("accountsChanged", (accounts: any) => {
        console.log(accounts);
      });
    } else {
      setWallet({
        accessing: false,
        account: null,
        connected: false,
        installed: false,
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessingWallet: wallet.accessing,
        walletIsInstalled: wallet.installed,
        currentAccount: wallet.account,
        walletIsConnected: wallet.connected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthenticationProvider;

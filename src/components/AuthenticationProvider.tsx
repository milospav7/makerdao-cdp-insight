import { createContext, useEffect, useState } from "react";

interface IProps {
  children: React.ReactNode;
}

interface IAuthenticationContext {
  accessingWallet: boolean;
  walletIsInstalled: boolean;
  walletIsConnected: boolean;
  currentAccount: any;
  error: any;
}

export const AuthContext = createContext<IAuthenticationContext | undefined>(
  undefined
);

const AuthenticationProvider = ({ children }: IProps) => {
  const [wallet, setWallet] = useState<IAuthenticationContext>({
    accessingWallet: true,
    walletIsInstalled: window.ethereum !== undefined,
    walletIsConnected: false,
    currentAccount: null,
    error: null,
  });

  const setWalletInfo = (accounts: any) => {
    const connected = accounts.length > 0;
    const account = connected ? accounts[0] : null;

    setWallet({
      accessingWallet: false,
      currentAccount: account,
      walletIsConnected: connected,
      walletIsInstalled: true,
      error: null,
    });
    console.log(accounts);
  };

  const checkWalletConnection = async () => {
    try {
      const response = await window.ethereum!.request({
        method: "eth_accounts",
      });
      setWalletInfo(response);
    } catch (err) {
      setWallet({
        accessingWallet: false,
        currentAccount: null,
        walletIsConnected: false,
        walletIsInstalled: false,
        error: err,
      });
    }
  };

  useEffect(() => {
    if (window.ethereum !== undefined) {
      window.ethereum.on("accountsChanged", setWalletInfo);
      checkWalletConnection();
    } else {
      setWallet({
        accessingWallet: false,
        currentAccount: null,
        walletIsConnected: false,
        walletIsInstalled: false,
        error: null,
      });
    }
    return () => {
      window.ethereum?.removeListener("accountsChanged", setWalletInfo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessingWallet: wallet.accessingWallet,
        walletIsInstalled: wallet.walletIsInstalled,
        currentAccount: wallet.currentAccount,
        walletIsConnected: wallet.walletIsConnected,
        error: wallet.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthenticationProvider;

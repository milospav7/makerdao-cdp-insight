import { createContext, useEffect, useState } from "react";

interface IProps {
  children: React.ReactNode;
}

interface IAuthenticationContext {
  accessingWallet: boolean;
  walletIsInstalled: boolean;
  walletIsConnected: boolean;
  currentAccount: any;
  error: null;
}

export const AuthContext = createContext<IAuthenticationContext>({
  accessingWallet: true,
  walletIsInstalled: window.ethereum !== undefined,
  walletIsConnected: false,
  currentAccount: null,
  error: null,
});

const AuthenticationProvider = ({ children }: IProps) => {
  const [wallet, setWallet] = useState({
    accessing: true,
    installed: window.ethereum !== undefined,
    connected: false,
    account: null,
    error: null,
  });

  const handleWalletManipulationError = (error: any) => {
    console.error(error);
    setWallet({
      accessing: false,
      account: null,
      connected: false,
      installed: false,
      error,
    });
  };

  const setWalletInfo = (accounts: any) => {
    const connected = accounts.length > 0;
    const account = connected ? accounts[0] : null;

    setWallet({
      accessing: false,
      account,
      connected,
      installed: true,
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
      handleWalletManipulationError(err);
    }
  };

  useEffect(() => {
    if (window.ethereum !== undefined) {
      window.ethereum.on("accountsChanged", setWalletInfo);
      checkWalletConnection();
    } else {
      setWallet({
        accessing: false,
        account: null,
        connected: false,
        installed: false,
        error: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessingWallet: wallet.accessing,
        walletIsInstalled: wallet.installed,
        currentAccount: wallet.account,
        walletIsConnected: wallet.connected,
        error: wallet.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthenticationProvider;

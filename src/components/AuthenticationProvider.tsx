import { createContext, useEffect, useState } from "react";

interface IProps {
  children: React.ReactNode;
}

interface IAuthenticationWallet {
  accessing: boolean;
  installed: boolean;
  connected: boolean;
  account: any;
}
interface IAuthenticationContext {
  wallet: IAuthenticationWallet;
  error: any;
}

const walletInitialState: IAuthenticationWallet = {
  accessing: true,
  account: null,
  connected: false,
  installed: false,
};

export const AuthContext = createContext<IAuthenticationContext | undefined>(
  undefined
);

const AuthenticationProvider = ({ children }: IProps) => {
  const [context, setContext] = useState<IAuthenticationContext>({
    wallet: walletInitialState,
    error: null,
  });

  const updateWallet = (accounts: any) => {
    const connected = accounts.length > 0;
    const account = connected ? accounts[0] : null;

    setContext({
      wallet: {
        accessing: false,
        account,
        connected,
        installed: true,
      },
      error: null,
    });
    console.log(accounts);
  };

  const setInitialWallet = async () => {
    try {
      const response = await window.ethereum!.request({
        method: "eth_accounts",
      });
      updateWallet(response);
    } catch (err) {
      setContext({
        wallet: walletInitialState,
        error: err,
      });
    }
  };

  useEffect(() => {
    if (window.ethereum !== undefined) {
      window.ethereum.on("accountsChanged", updateWallet);
      setInitialWallet();
    } else {
      setContext({
        wallet: { ...walletInitialState, accessing: false },
        error: null,
      });
    }

    return () => {
      window.ethereum?.removeListener("accountsChanged", updateWallet);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export default AuthenticationProvider;

import { useEffect, useState } from "react";
import { AuthContext } from "./hooks";
import {
  IAuthenticationContext,
  IAuthenticationProviderProps,
  IAuthenticationWallet,
} from "./interfaces";

const walletInitialState: IAuthenticationWallet = {
  accessing: true,
  account: null,
  connected: false,
  installed: false,
};

const AuthenticationProvider = ({ children }: IAuthenticationProviderProps) => {
  const [wallet, setWallet] =
    useState<IAuthenticationWallet>(walletInitialState);
  const [error, setError] = useState("");

  const updateWallet = (accounts: any) => {
    const connected = accounts.length > 0;
    const account = connected ? accounts[0] : null;

    setWallet({
      accessing: false,
      account,
      connected,
      installed: true,
    });
  };

  const handleError = (friendlyError: string, actualError: any) => {
    setError(friendlyError);
    console.error(actualError);
  };

  const requestWalletConnection = async () => {
    try {
      const response = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      updateWallet(response);
    } catch (err: any) {
      const userJustRejectedConnection = err?.code === 4001;
      if (userJustRejectedConnection) return; // We should not treat this as some app error, this is somehow potentially expected situation that user maybe does not want to connect to our website
      handleError(
        "There was an error while trying to connect with you wallet.",
        err
      );
    }
  };

  const setInitialWallet = async () => {
    try {
      const response = await window.ethereum!.request({
        method: "eth_accounts",
      });
      updateWallet(response);
    } catch (err) {
      console.error("ERROR ON WALLET INITIALIZATION", err);
      setWallet(walletInitialState);
      handleError(
        "There was an error while trying to acceess your wallet information.",
        err
      );
    }
  };

  const tryToAccessWallet = async () => {
    await setInitialWallet();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", updateWallet);
      await setInitialWallet();
    } else {
      setWallet({ ...walletInitialState, accessing: false });
    }
  };

  const retryWalletAccess = async () => {
    setWallet(walletInitialState); // Reset whole state
    await tryToAccessWallet();
  };

  useEffect(() => {
    tryToAccessWallet();

    return () => {
      window.ethereum?.removeListener("accountsChanged", updateWallet);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context: IAuthenticationContext = {
    wallet,
    error,
    actions: {
      requestWalletConnection,
      retryWalletAccess,
    },
  };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export default AuthenticationProvider;

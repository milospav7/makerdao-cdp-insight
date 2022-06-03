export interface IAuthenticationProviderProps {
  children: React.ReactNode;
}

export interface IAuthenticationWallet {
  accessing: boolean;
  installed: boolean;
  connected: boolean;
  account: any;
}

export interface IAuthenticationContextActions {
  retryWalletAccess: () => Promise<void>;
  requestWalletConnection: () => Promise<any>;
}
export interface IAuthenticationContext {
  wallet: IAuthenticationWallet;
  error: string;
  actions: IAuthenticationContextActions;
}

export interface ILayoutContext {
  setLayoutProgressPercentage: (progress: number) => void;
  setLayoutProgressVisiblity: (visibility: boolean) => void;
}

export interface IAuthenticationProviderProps {
  children: React.ReactNode;
}

export interface IAuthenticationWallet {
  accessing: boolean;
  installed: boolean;
  connected: boolean;
  account: any;
}
export interface IAuthenticationContext {
  wallet: IAuthenticationWallet;
  error: any;
}

export interface ILayoutContext {
  setLayoutProgressPercentage: (progress: number) => void;
  setLayoutProgressVisiblity: (visibility: boolean) => void;
}

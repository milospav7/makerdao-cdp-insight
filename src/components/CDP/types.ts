export type CollateralType = "ETH-A" | "WBTC-A" | "USDC-A";

export interface InputsState {
  type: CollateralType;
  cdpId: string;
}

export type TServiceOptions = {
  onError: (error: any) => void;
};

export type TQueryParams = {
  id: number;
  type: CollateralType;
};

export interface IGridColumn {
  field: string;
  title: string;
  formater?: (data: any) => any;
}

export interface IGridProps {
  columns: IGridColumn[];
  data: any[];
  noDataMessage?: string;
  onRowClick: (rowData: any) => void;
}

export interface ICdpDetailsProps {
  cdpId: string;
}

export type TCollateralPricePerType = {
  [key in CollateralType]: number;
};

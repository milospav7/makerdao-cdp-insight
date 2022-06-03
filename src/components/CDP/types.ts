export type CollateralType = "ETH-A" | "WBTC-A" | "USDC-A";

export interface InputsState {
  type: CollateralType;
  cdpId: string | null;
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
}

export interface IGridProps {
  columns: IGridColumn[];
  data: any[];
  noDataMessage?: string;
  onRowClick: (rowData: any) => void;
}

export interface ICdpDetailsProps {
  cdpId: string
}

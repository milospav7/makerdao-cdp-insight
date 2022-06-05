export const DefaultProps = {
  voidFunction: () => null,
};

// 1000 - All ok
// 1100 - Aborted
// 1200 - "Backend" exception
export const StatusCodes = { OK: 1000, Aborted: 1100, Exception: 1200 };
export type TResponseCode = 1000 | 1100 | 1200;

export class RpcResponse<T> {
  isSuccess: boolean;
  code: number;
  data: T;
  error: any;

  constructor(success: boolean, code: number, data: any, error?: any) {
    this.isSuccess = success;
    this.code = code;
    this.data = data;
    this.error = error;
  }
}

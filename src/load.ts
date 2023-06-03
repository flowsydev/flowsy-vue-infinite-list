export type LoadFunction = (pageNumber: number, pageSize: number) => Promise<Array<any>>;

export interface LoadErrorEvent {
  error: any;
  pageNumber: number;
  pageSize: number;
}

export type LoadErrorHook = (event: LoadErrorEvent) => void;

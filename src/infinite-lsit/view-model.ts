import { ComputedRef } from "vue";

export type LoadFunction = (pageNumber: number, pageSize: number) => Promise<Array<any>>;

export interface FlowsyVirtualListItem<T = any> {
  target: T;
  height?: number;
  width?: number;
  display?: string;
}

export interface FlowsyLoadErrorContext {
  error: any;
  pageNumber: number;
  pageSize: number;
}

export interface FlowsyInfiniteListRef {
  pageNumber: ComputedRef<number>,
  realItems: ComputedRef<any[]>,
  virtualItems: ComputedRef<any[]>,
  isLoading: ComputedRef<boolean>,
  isEmpty: ComputedRef<boolean>,
  loadMore: () => Promise<void>;
  reset: () => void;
}

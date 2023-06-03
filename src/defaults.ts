import { LoadErrorHook } from "./load";

export interface InfiniteListDefaults {
  loadInterval: number;
  pageSize: number;
  height: number | string;
  itemHeight: number;
  itemMarginBottom: number;
  scrollDistance?: number;
  scrollItemHeight: boolean;
  onError?: LoadErrorHook;
}

export const defaults: InfiniteListDefaults = {
  loadInterval: 2000,
  pageSize: 20,
  height: "100vh",
  itemHeight: 20,
  itemMarginBottom: 0,
  scrollDistance: 0,
  scrollItemHeight: false
}

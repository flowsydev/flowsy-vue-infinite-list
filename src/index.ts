import { App, Plugin } from "vue";
import { defaults } from "./defaults";
import InfiniteList from "./InfiniteList.vue";
import { LoadErrorHook } from "./load";

export interface InfiniteListOptions {
  loadInterval?: number;
  pageSize?: number;
  height?: number | string;
  itemHeight?: number;
  itemMarginBottom?: number;
  scrollDistance?: number;
  scrollItemHeight?: boolean;
  onError?: LoadErrorHook;
}

let installed = false;

export type { LoadFunction } from "./load"
export default <Plugin> {
  install(app: App, options?: InfiniteListOptions) {
    if (installed) return;

    if (options?.loadInterval !== undefined)
      defaults.loadInterval = options.loadInterval;

    if (options?.pageSize !== undefined)
      defaults.pageSize = options.pageSize;

    if (options?.height !== undefined)
      defaults.height = options.height;

    if (options?.itemHeight !== undefined)
      defaults.itemHeight = options.itemHeight;

    if (options?.itemMarginBottom !== undefined)
      defaults.itemMarginBottom = options.itemMarginBottom;

    if (options?.scrollDistance !== undefined)
      defaults.scrollDistance = options.scrollDistance;

    if (options?.scrollItemHeight !== undefined)
      defaults.scrollItemHeight = options.scrollItemHeight;

    app.component("InfiniteList", InfiniteList);

    installed = true;
  }
}

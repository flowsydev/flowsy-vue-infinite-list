import { App, Plugin } from "vue";
import FlowsyInfiniteList from "./infinite-lsit/FlowsyInfiniteList.vue";

let installed = false;

export type { FlowsyInfiniteListRef, FlowsyVirtualListItem, LoadFunction, FlowsyLoadErrorContext } from "./infinite-lsit/view-model"
export function createInfiniteList(): Plugin {
  return {
    install(app: App) {
      if (installed) return;
      app.component("FlowsyInfiniteList", FlowsyInfiniteList);
      installed = true;
    }
  };
}
export default FlowsyInfiniteList;

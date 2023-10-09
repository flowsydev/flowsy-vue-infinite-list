import { App, Plugin } from "vue";
import FInfiniteList from "./FInfiniteList/index.vue";

let installed = false;

export type { FInfiniteListRef, LoadFunction, LoadErrorContext } from "./FInfiniteList/view-model"
export function createInfiniteList(): Plugin {
  return {
    install(app: App) {
      if (installed) return;
      app.component("FInfiniteList", FInfiniteList);
      installed = true;
    }
  };
}
export default FInfiniteList;

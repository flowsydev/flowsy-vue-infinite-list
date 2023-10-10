<template>
  <div class="flowsy-infinite-list-container" :key="`flowsy_infinite_list_container_${pristine ? 'pristine' : ''}`"
       v-bind="containerProps"
       :style="{ height, width }"
  >
    <div :key="`flowsy_infinite_list_wrapper_${pristine ? 'pristine' : ''}`" v-bind="wrapperProps">
      <template v-for="{ data, index } in list" :key="`flowsy_infinite_list_item_${index}`">
        <slot
          name="item"
          v-bind="{
            item: data.target,
            index,
            first: index === 0,
            last: index === items.length - 1,
            isLoading,
            style: resolveVirtualItemStyle(data)
          }"
        />
      </template>
      <div ref="threshold" class="flowsy-infinite-list-threshold" :style="thresholdStyle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVirtualList, UseVirtualListOptions } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, PropType, ref, toRefs, watch } from "vue";
import {
  LoadErrorContext,
  LoadFunction,
  VirtualListItem
} from "./view-model";

const props = defineProps({
  load: {
    type: Function as PropType<LoadFunction>,
    required: true
  },
  pageSize: {
    type: Number,
    default: 10
  },
  height: {
    type: String,
    default: "100%"
  },
  width: {
    type: String,
    default: "100%"
  },
  horizontal: {
    type: Boolean,
    default: false
  },
  itemHeight: {
    type: [Number, String, Function] as PropType<number | ((item: any, index: number) => number) | undefined>,
    default: 100
  },
  itemWidth: {
    type: [Number, String, Function] as PropType<number | ((item: any, index: number) => number) | undefined>,
    default: undefined
  },
  itemDisplay: {
    type: [String, Function] as PropType<string | ((item: any, index: number) => string) | undefined>,
    default: undefined
  },
  threshold: {
    type: Number,
    default: 10
  }
});
const { load, pageSize, height, horizontal, itemHeight, itemWidth, itemDisplay, threshold: thresholdSize } = toRefs(props);
const emit = defineEmits<{
  (event: "load", newItems: any[]): void;
  (event: "error", context: LoadErrorContext): void;
}>();

const pristine = ref(true);
const pageNumber = ref(0);
const items = ref<any[]>([]);
const isLoading = ref(false);
const isEmpty = ref(true);
const lastError = ref<LoadErrorContext>();
function resolveItemHeight(item: any, index: number): number | undefined {
  const ih = itemHeight?.value;
  if (ih === undefined) return;
  return typeof ih === "function" ? ih(item, index) : Number(ih);
}
function resolveItemWidth(item: any, index: number): number | undefined {
  const iw = itemWidth?.value;
  if (iw === undefined) return;
  return typeof iw === "function" ? iw(item, index) : Number(iw);
}
function resolveItemDisplay(item: any, index: number): string | undefined {
  const id = itemDisplay?.value;
  if (id === undefined) return;
  return typeof id === "function" ? id(item, index) : id;
}
function resolveVirtualItemStyle(virtualItem: VirtualListItem): any {
  const style: any = {};

  if (virtualItem.height !== undefined)
    style.height = `${virtualItem.height}px`;

  if (virtualItem.width !== undefined)
    style.width = `${virtualItem.width}px`;

  if (virtualItem.display !== undefined)
    style.display = virtualItem.display;

  return style;
}
const virtualItems = computed<VirtualListItem[]>(() => items.value.map((item, index) => {
  const virtualItem: VirtualListItem = { target: item };
  const height = resolveItemHeight(item, index);
  const width = resolveItemWidth(item, index);
  const display = resolveItemDisplay(item, index);
  if (height !== undefined) virtualItem.height = height;
  if (width !== undefined) virtualItem.width = width;
  if (display !== undefined) virtualItem.display = display;
  return virtualItem;
}));
const virtualListOptions: UseVirtualListOptions = horizontal.value
  ? {
    itemWidth: (index) => resolveItemWidth(items.value[index], index) || 0
  }
  : {
    itemHeight: (index) => resolveItemHeight(items.value[index], index) || 0
  }
const { list, containerProps, wrapperProps } = useVirtualList<VirtualListItem>(virtualItems, virtualListOptions);
const scrollObserver = ref<IntersectionObserver>();
const threshold = ref<Element>();
const thresholdStyle = computed(() => ({
  display: "block",
  height: `${thresholdSize.value}px`,
  width: `${thresholdSize.value}px`
}));
function observeScrolling() {
  if (scrollObserver.value || !containerProps.ref.value || !threshold.value) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;
      await loadMore();
    });
  }, {
    root: containerProps.ref.value,
    rootMargin: "0px",
    threshold: 0.5
  });
  observer.observe(threshold.value);
  scrollObserver.value = observer;
}
async function loadMore(): Promise<void> {
  if (isLoading.value || (!pristine.value && isEmpty.value) || lastError.value)
    return;

  isLoading.value = true;
  let decrementPageNumber = true;
  try {
    if (pristine.value) {
      pageNumber.value = 1;
      pristine.value = false;
    } else
      pageNumber.value++;

    const newItems = (await load.value(pageNumber.value, pageSize.value) || []);
    await nextTick();
    if (newItems.length > 0) {
      items.value.push(...newItems);
    } else {
      pageNumber.value--;
      decrementPageNumber = false;
    }

    pristine.value = false;
    isEmpty.value = items.value.length === 0;

    emit("load", newItems);
  } catch (error) {
    const context: LoadErrorContext = {
      error,
      pageNumber: pageNumber.value,
      pageSize: pageSize.value
    };

    if (decrementPageNumber)
      pageNumber.value--;

    lastError.value = context;
    emit("error", context);
  } finally {
    isLoading.value = false;
  }
}
const resetRequested = ref(false);
async function completeReset() {
  items.value = [];
  pageNumber.value = 0;
  isLoading.value = false;
  pristine.value = true;
  resetRequested.value = false;
  await loadMore();
}
watch(isLoading, (newValue, oldValue) => {
  if (!resetRequested.value || newValue || newValue === oldValue) return;
  completeReset();
});

function reset() {
  if (isLoading.value) {
    resetRequested.value = true;
    return;
  }
  completeReset();
}

onMounted(async () => {
  await loadMore();
  observeScrolling();
});
onUnmounted(() => {
  if (!scrollObserver.value || !threshold.value) return;
  scrollObserver.value.unobserve(threshold.value);
});

defineSlots<{
  item(props: {
    item: any,
    index: number,
    first: boolean,
    last: boolean,
    isLoading: boolean,
    style: any
  }): any;
}>();

defineExpose({
  pageNumber: computed(() => pageNumber.value),
  realItems: computed(() => items.value),
  virtualItems: computed(() => list.value),
  isLoading: computed(() => isLoading.value),
  isEmpty: computed(() => isEmpty.value),
  loadMore,
  reset
});
</script>

<script lang="ts">
export default {
  name: "FInfiniteList"
};
</script>

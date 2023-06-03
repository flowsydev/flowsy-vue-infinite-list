<script setup lang="ts">
import { useInfiniteScroll, useVirtualList } from "@vueuse/core";
import {
  computed,
  defineComponent,
  nextTick,
  PropType,
  ref,
  StyleValue,
  toRefs
} from "vue";
import { defaults } from "./defaults";
import type { LoadErrorEvent, LoadFunction } from "./load";

const props = defineProps({
  load: {
    type: Function as PropType<LoadFunction>,
    required: true
  },
  loadInterval: {
    type: [Number, String],
    default: undefined
  },
  pageSize: {
    type: [Number, String],
    default: undefined
  },
  height: {
    type: [Number, String],
    default: undefined
  },
  itemHeight: {
    type: [Number, String],
    default: undefined
  },
  itemMarginBottom: {
    type: [Number, String],
    default: undefined
  },
  scrollDistance: {
    type: [Number, String],
    default: undefined
  },
  scrollItemHeight: {
    type: Boolean,
    default: undefined
  }
});

const { load, loadInterval, pageSize, height, itemHeight, itemMarginBottom, scrollDistance, scrollItemHeight } = toRefs(props);
const loadIntervalComputed = computed(() => {
  const rawValue = loadInterval?.value;
  return rawValue !== undefined && !Number.isNaN(rawValue) ? Number(rawValue) : defaults.loadInterval;
});
const pageSizeComputed = computed(() => {
  const rawValue = pageSize?.value;
  return rawValue !== undefined && !Number.isNaN(rawValue) ? Number(rawValue) : defaults.pageSize;
});
const heightComputed = computed(() => {
  const rawValue = height?.value;
  return rawValue !== undefined && !Number.isNaN(rawValue) ? Number(rawValue) : defaults.height;
});
const itemHeightComputed = computed(() => {
  const rawValue = itemHeight?.value;
  return rawValue !== undefined && !Number.isNaN(rawValue) ? Number(rawValue) : defaults.itemHeight;
});
const itemMarginBottomComputed = computed(() => {
  const rawValue = itemMarginBottom?.value;
  return rawValue !== undefined && !Number.isNaN(rawValue) ? Number(rawValue) : defaults.itemMarginBottom;
});
const scrollDistanceComputed = computed(() => {
  const rawValue = scrollDistance?.value;
  return rawValue !== undefined && !Number.isNaN(rawValue) ? Number(rawValue) : defaults.scrollDistance;
});
const scrollItemHeightComputed = computed(() => {
  const rawValue = scrollItemHeight?.value;
  return rawValue !== undefined && !Number.isNaN(rawValue) ? Number(rawValue) : defaults.scrollItemHeight;
});

const items = ref<Array<any>>([]);
const pageNumber = ref(0);
const isLoading = ref(false);
const executed = ref(false);

const itemStyle = computed<StyleValue>(() => ({
  height: `${itemHeightComputed.value}px`,
  marginBottom: `${itemMarginBottomComputed.value}px`
}));

const threshold = ref<HTMLElement | undefined>();
const thresholdReached = ref(false);

const { list, containerProps, wrapperProps } = useVirtualList(
  items,
  {
    itemHeight: () => itemHeightComputed.value
  }
);

useInfiniteScroll(
  containerProps.ref,
  loadMore,
  {
    interval: loadIntervalComputed.value,
    distance: scrollDistanceComputed.value
  }
);

const emit = defineEmits<{
  (event: "error", error: LoadErrorEvent): void
}>();

async function loadMore() {
  if (isLoading.value) return;

  if (thresholdReached.value) {
    thresholdReached.value = false;
    return;
  }

  try {
    if (executed)
      pageNumber.value++;
    else
      pageNumber.value = 1;

    isLoading.value = true;
    const newItems = (await load.value(pageNumber.value, pageSizeComputed.value) || []);

    const container = containerProps.ref.value;
    let scrollOffset = 0;

    if (newItems.length > 0) {
      items.value.push(...newItems);
      if (scrollItemHeightComputed.value && container && container.scrollTop > 0) {
        scrollOffset = container.scrollTop + itemHeightComputed.value;
      }
    } else if (pageNumber.value > 1) {
      pageNumber.value--;

      const thresholdHeight = threshold.value?.getBoundingClientRect().height;
      if (container && thresholdHeight) {
        scrollOffset = container.scrollTop - thresholdHeight * 1.5;
        thresholdReached.value = true;
      }
    }

    executed.value = true;

    if (container && scrollOffset != 0) {
      await nextTick();
      container.scroll({
        top: scrollOffset,
        behavior: "smooth"
      });
    }
  } catch (error) {
    const event: LoadErrorEvent = {
      error,
      pageNumber: pageNumber.value,
      pageSize: pageSizeComputed.value
    };
    emit("error", event);
    if (typeof defaults?.onError === "function")
      defaults.onError(event);
  } finally {
    isLoading.value = false;
  }
}

defineComponent({
  name: "InfiniteList"
});
</script>

<template>
  <div>
    <div :key="`infinite_list_container${executed ? '' : '_empty'}`" v-bind="containerProps" :style="{ height: heightComputed }">
      <div :key="`infinite_list_wrapper${executed ? '' : '_empty'}`" v-bind="wrapperProps">
        <div v-for="{ index, data } in list" :key="`infinite_list_item_${index}`" :style="itemStyle">
          <slot name="item" v-bind="{ item: data, index }"></slot>
        </div>
        <div v-if="isLoading" class="progress-area">
          <slot name="progress">
            <div class="progress-container">
              <div class="progress-ellipsis"><div></div><div></div><div></div><div></div></div>
            </div>
          </slot>
        </div>
        <div ref="threshold" style="height: 50px;"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.progress-container {
    display: flex;
    justify-content: center;
}

.progress-ellipsis {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
}
.progress-ellipsis div {
    position: absolute;
    top: 33px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #555;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.progress-ellipsis div:nth-child(1) {
    left: 8px;
    animation: progress-ellipsis1 0.6s infinite;
}
.progress-ellipsis div:nth-child(2) {
    left: 8px;
    animation: progress-ellipsis2 0.6s infinite;
}
.progress-ellipsis div:nth-child(3) {
    left: 32px;
    animation: progress-ellipsis2 0.6s infinite;
}
.progress-ellipsis div:nth-child(4) {
    left: 56px;
    animation: progress-ellipsis3 0.6s infinite;
}
@keyframes progress-ellipsis1 {
    0% {
        transform: scale(0);
    }
    100% {
        transform: scale(1);
    }
}
@keyframes progress-ellipsis3 {
    0% {
        transform: scale(1);
    }
    100% {
        transform: scale(0);
    }
}
@keyframes progress-ellipsis2 {
    0% {
        transform: translate(0, 0);
    }
    100% {
        transform: translate(24px, 0);
    }
}
</style>

# Infinite List for Vue

The **FlowsyInfiniteList** component is a wrapper for the IntersectionObserver API and **useVirtualList** from [@vueuse/core](https://www.npmjs.com/package/@vueuse/core)
that combines their features and adds a simple way to render items every time the user scrolls down the page.


## Auto-import (optional)

```typescript
import { createApp } from "vue";
import { createInfiniteList } from "@flowsydev/vue-infinite-list";
import App from "./App.vue";

const infiniteList = createInfiniteList();

app.use(infiniteList);

app.mount("#app");
```


## Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import FlowsyInfiniteList, { FlowsyLoadErrorContext } from "@flowsydev/vue-infinite-list";
import type { Customer } from "@/composables/customer-service";
import { useCustomerService } from "@/composables/customer-service";

const searchTerm = ref("");

// Fictitious service used to manage customer data
const { loadCustomers } = useCustomerService();

async function load(pageNumber: number, pageSize: number): Promise<Array<Customer>> {
  // pageNumber => the current page number to load
  // pageSize => how many items to load for pageNumber
  
  // Customer could be defined as:
  // interface Customer {
  //   forename: string;
  //   surname: string;
  //   fullName: string;
  //   email: string;
  //   phoneNumber: string;
  // }
  return await loadCustomers({ searchTerm: searchTerm.value, pageNumber, pageSize });
}

function onError(context: FlowsyLoadErrorContext) {
  const { error, pageNumber, pageSize } = context;
  console.error("Failed to load items", { error, pageNumber, pageSize });
}
</script>

<template>
  <div>
    <div>
      <!-- Input box to type a search term -->
      <input v-model="searchTerm" type="text">
    </div>
    
    <!--
    The list of search results to be populated as the user scrolls down the page
    
    load: A function used to load items for the list ( (pageNumber: number, pageSize: number) => any[] )
    item-height: Value or function to resolve the item height (used to calculate how many items are rendered in the DOM)
    page-size: How many items to load every time the load function is invoked
    @error: Event emitted if an error occurs when loading items
    -->
    <flowsy-infinite-list :load="load" item-height="120" page-size="50" @error="onError">
      <template #item="{ item, index, first, last, isLoading, style }">
        <!--
        item: The current item (Customer)
        index: The zero-based index of the current item 
        first: This item is the first one of the list (boolean)
        last: This item is the last one of the list (boolean)
        isLoading: The list is loading items
        style: An object with CSS styles for the current item
        -->
        <div class="row" :style="style">
          <div class="col">
            <h1>
              {{ index + 1 }}
            </h1>
          </div>
          <div class="col">
            <h4>{{ item.fullName }}</h4>
            <p>
              {{ item.email }} <br>
              {{ item.phoneNumber }}
            </p>
          </div>
        </div>
        <hr v-if="!last">
      </template>
    </flowsy-infinite-list>
  </div>
</template>
```

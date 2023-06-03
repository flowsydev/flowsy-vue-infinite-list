# Infinite List for Vue

The **InfiniteList** component is a wrapper for **useVirtualList** and **useInfiniteScroll** from [@vueuse/core](https://www.npmjs.com/package/@vueuse/core)
that combines the features from both composables and adds a simple way to render items every time the user scrolls down the page.


## Configure Global Options

```typescript
import { createApp } from "vue";
import InfiniteList from "@flowsydev/vue-infinite-list";
import App from "./App.vue";

app.use(InfiniteList, {
  pageSize: 20, // How many items to load in every scroll event
  loadInterval: 2000, // Milliseconds to wait after loading to avoid multiple invocations
  scrollItemHeight: true, // Whether or not to scroll down after loading, as much as the item height, so the new items are visible in the viewport
  onError: (error: any) => {
    // Global hook for error handling
    console.error(error);
  }
});

app.mount("#app");
```


## Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { Customer } from "@/composables/customer-service";
import { useCustomerService } from "@/composables/customer-service";

const searchTerm = ref("");
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
</script>

<template>
  <div>
    <div>
      <!-- Input box to type a search term -->
      <input v-model="searchTerm" type="text">
    </div>
    
    <!-- The list of search results to be populated as the user scrolls down the page -->
    <infinite-list :load="load" item-height="120px" item-margin-bottom="20">
      <template #item="{ item, index }">
        <!--
        item: The current item (Customer)
        index: The zero-based index of the current item 
        -->
        <div class="row">
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
      </template>
      <template #progress>
        <!-- Custom progress indicator -->
        Loading...
      </template>
    </infinite-list>
  </div>
</template>
```

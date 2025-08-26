<template>
  <div class="col-span-3 mt-20 flex flex-col gap-y-5">
    <div v-for="item in filterList" :key="item.type">
      <div class="label-title">
        <component :is="filterIconMap[item.type]" :size="14" />
        {{ filterMap[item.type] }}
      </div>

      <div :class="[item.type === 'YEAR' || item.type === 'LOCATION' ? 'flex flex-wrap gap-1' : 'flex flex-col gap-y-1']">
        <router-link v-if="item.type === 'ALBUM'" to="/fav-gallery" class="label-item label-item-dark flex items-center gap-x-1">
          FAVS
          <Sparkle :size="12" />
        </router-link>
        <router-link
          v-for="listItem in item.list"
          :key="listItem.value"
          :to="`${filterLinkMap[item.type]}/${listItem.value}`"
          class="label-item label-item-dark"
        >
          {{ listItem.label }}
        </router-link>
      </div>
    </div>

    <div class="text-[14px] text-gray-500/80">{{ total }} PHOTOS</div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { FilterGroupItem } from '@/types/photos'

import { Sparkle } from 'lucide-vue-next'
import { filterIconMap, filterMap, filterLinkMap } from '@/constant/filter'

defineProps({
  filterList: { type: Array as PropType<FilterGroupItem[]>, default: () => [] },
  total: { type: Number as PropType<number>, required: true }
})
</script>

<style lang="scss" scoped>
.label-title {
  @apply mb-1 flex gap-x-1 text-[14px]/[18px] font-medium;
}

.label-item {
  @apply w-fit cursor-pointer rounded-[4px] bg-gray-100 px-1 py-0.5 text-[12px] text-gray-500/80 hover:bg-gray-100/60 hover:text-black;
}

.label-item-dark {
  @apply dark:bg-gray-500/30 dark:hover:text-white dark:text-gray-400;
}

.label-more {
  @apply flex w-fit cursor-pointer px-1 py-0.5 text-[12px] text-gray-500/80 hover:bg-gray-100/60 hover:text-black;
}
</style>

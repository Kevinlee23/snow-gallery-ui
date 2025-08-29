<template>
  <div
    :class="{
      'grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4': gridMode,
      'flex flex-col gap-y-1': !gridMode
    }"
  >
    <div v-for="item in photos" :key="item._id">
      <PhotosItem :layoutActive="layoutActive" :selectMode="selectMode" :photo="item" :selectPhotos="selectPhotos" @select="emit('select', $event)" />
    </div>
  </div>
  <div v-if="hasNextPage || isPending" class="mt-2 w-full" :class="{ 'w-full lg:w-[960px]': !gridMode }">
    <div v-if="hasNextPage && !isPending" class="flex justify-center">
      <div @click="emit('onFetchNextPage')" class="w-fit cursor-pointer hover:font-medium dark:hover:text-gray-400">加载更多</div>
    </div>
    <div v-if="isPending" class="w-full text-center">加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { LayoutType, Photo } from '@/types/photos'

import { computed } from 'vue'
import PhotosItem from './photos-item.vue'

const props = defineProps({
  layoutActive: { type: String as PropType<LayoutType>, required: true },
  photos: { type: Array as PropType<Photo[]>, required: true },
  hasNextPage: { type: Boolean, default: false },
  isPending: { type: Boolean, default: false },
  selectMode: { type: Boolean, default: false },
  selectPhotos: { type: Array as PropType<string[]>, default: () => [] }
})

const emit = defineEmits(['onFetchNextPage', 'select'])

const gridMode = computed(() => {
  return props.layoutActive === 'grid' || props.layoutActive === 'filter'
})
</script>

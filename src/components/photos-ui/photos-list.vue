<template>
  <div
    :class="{
      'grid grid-cols-4 gap-1': layoutActive === 'grid' || layoutActive === 'filter' || layoutActive === 'select',
      'flex flex-col gap-y-1': layoutActive === 'list'
    }"
  >
    <div v-for="item in photos" :key="item._id">
      <PhotosItem :layoutActive="layoutActive" :photo="item" :selectPhotos="selectPhotos" @select="handleSelect" />
    </div>
  </div>
  <div v-if="hasNextPage || isPending" class="mt-2" :class="{ 'w-[960px]': layoutActive === 'list' || layoutActive === 'filter' }">
    <div v-if="hasNextPage && !isPending" class="flex justify-center">
      <div @click="emit('onFetchNextPage')" class="w-fit cursor-pointer hover:font-medium">加载更多</div>
    </div>
    <div v-if="isPending" class="w-full text-center">Loading...</div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { LayoutType, Photo } from '@/types/photos'

import PhotosItem from './photos-item.vue'

defineProps({
  layoutActive: { type: String as PropType<LayoutType>, required: true },
  photos: { type: Array as PropType<Photo[]>, required: true },
  hasNextPage: { type: Boolean, default: false },
  isPending: { type: Boolean, default: false },
  selectPhotos: { type: Array as PropType<string[]>, default: () => [] }
})

const emit = defineEmits(['onFetchNextPage', 'select'])

const handleSelect = (_id: string) => {
  emit('select', _id)
}
</script>

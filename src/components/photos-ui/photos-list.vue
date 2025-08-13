<template>
  <div
    :class="{
      'grid grid-cols-4 gap-1': layoutActive === 'grid' || layoutActive === 'filter',
      'flex flex-col gap-y-1': layoutActive === 'list'
    }"
  >
    <div v-for="item in photos" :key="item._id">
      <PhotosItem :layoutActive="layoutActive" :photo="item" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { LayoutType, Photo } from '@/types/photos'

import PhotosItem from './photos-item.vue'

defineProps({
  layoutActive: { type: String as PropType<LayoutType>, required: true },
  photos: { type: Array as PropType<Photo[]>, required: true }
})
</script>

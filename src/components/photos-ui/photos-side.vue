<template>
  <div class="col-span-3 mt-20 flex flex-col gap-y-5">
    <div v-for="item in filterList" :key="item.type">
      <div class="label-title">
        <component :is="filterIconMap[item.type]" :size="14" />
        {{ filterMap[item.type] }}
      </div>

      <div :class="[item.type === 'YEAR' || item.type === 'LOCATION' ? 'flex gap-x-1' : 'flex flex-col gap-y-1']">
        <router-link v-if="item.type === 'ALBUM'" to="/fav-gallery">
          <div class="label-item flex items-center gap-x-1">
            FAVS
            <Sparkle :size="12" />
          </div>
        </router-link>
        <router-link v-for="listItem in item.list" :key="listItem.value" :to="`${filterLinkMap[item.type]}/${listItem.value}`" class="label-item">
          {{ listItem.label }}
        </router-link>
      </div>
    </div>

    <div class="text-[14px] text-gray-500/80">{{ total }} PHOTOS</div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { FilterIconMapType, FilterListType, FilterMapType } from '@/types/photos'

import { CalendarDays, Camera, Film, Aperture, MapPin, Sparkle } from 'lucide-vue-next'

defineProps({
  filterList: { type: Array as PropType<FilterListType[]>, default: () => [] },
  total: { type: Number as PropType<number>, required: true }
})

const filterMap: FilterMapType = {
  YEAR: '拍摄年份',
  CAMERA: '相机型号',
  LENS: '镜头型号',
  ALBUM: '归属相簿',
  LOCATION: '拍摄地点'
}
const filterLinkMap: FilterMapType = {
  YEAR: '/year',
  CAMERA: '/camera',
  LENS: '/lenses',
  ALBUM: '/album',
  LOCATION: '/location'
}
const filterIconMap: FilterIconMapType = {
  YEAR: CalendarDays,
  CAMERA: Camera,
  LENS: Aperture,
  ALBUM: Film,
  LOCATION: MapPin
}
</script>

<style lang="scss" scoped>
.label-title {
  @apply mb-1 flex gap-x-1 text-[14px]/[18px] font-medium;
}

.label-item {
  @apply w-fit cursor-pointer rounded-[4px] bg-gray-100 px-1 py-0.5 text-[12px] text-gray-500/80 hover:bg-gray-100/60 hover:text-black;
}

.label-more {
  @apply flex w-fit cursor-pointer px-1 py-0.5 text-[12px] text-gray-500/80 hover:bg-gray-100/60 hover:text-black;
}
</style>

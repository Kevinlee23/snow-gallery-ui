<template>
  <div :class="{ 'flex gap-x-5': layoutActive === 'list' || layoutActive === 'item' }">
    <div class="aspect-[1.5/1] cursor-pointer overflow-hidden" :class="{ 'w-[960px]': layoutActive === 'list' || layoutActive === 'item' }">
      <router-link :to="`/p/${photo._id}`">
        <img :src="photo.imageUrl" alt="" class="h-full w-full object-cover" />
      </router-link>
    </div>

    <div v-if="layoutActive === 'list' || layoutActive === 'item'" class="flex flex-col gap-y-5">
      <div class="info-wrap">
        <div class="font-bold">{{ photo.title }}</div>
        <div class="info-item">
          <Camera :size="14" class="text-gray-500/80" />
          <div class="info-title">{{ photo.camera?.fullName || 'CAMERA' }}</div>
        </div>
        <div class="info-item">
          <Aperture :size="14" class="text-gray-500/80" />
          <div class="info-title">{{ photo.lenses?.fullName || 'LENS' }}</div>
        </div>
        <div class="info-item">
          <MapPin :size="14" class="text-gray-500/80" />
          <div class="info-title">{{ photo.location?.fullName || 'LOCATION' }}</div>
        </div>
      </div>
      <div class="info-wrap">
        <div class="info-title">{{ photo.focalLength ? `${photo.focalLength}mm` : '焦距未知' }}</div>
        <div class="info-title">{{ photo.aperture ? `ƒ/${photo.aperture}` : '光圈未知' }}</div>
        <div class="info-title">{{ photo.shutter ? `${photo.shutter}` : '快门未知' }}</div>
        <div class="info-title">{{ photo.ISO ? `ISO ${photo.ISO}` : 'ISO未知' }}</div>
      </div>
      <div class="info-wrap">
        <div class="info-title">{{ photo.shootingTimeAt ? new Date(photo.shootingTimeAt).toLocaleDateString() : 'DATE' }}</div>
      </div>
      <div class="flex gap-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Expand :size="14" class="text-gray-500 hover:text-black" @click="handleFullsize(photo.imageUrl, photo.title)" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Full</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Share :size="14" class="text-gray-500 hover:text-black" @click="handleShare" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Share</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </div>

  <ShareUI ref="shareUIRef" />
  <PhotosFullsize ref="photosFullsizeRef" />
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { LayoutType, Photo } from '@/types/photos'

import { ref } from 'vue'
import { Expand, Share, Camera, Aperture, MapPin } from 'lucide-vue-next'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import ShareUI from './share-ui.vue'
import PhotosFullsize from './photos-fullsize.vue'

const props = defineProps({
  layoutActive: { type: String as PropType<LayoutType>, required: true },
  photo: { type: Object as PropType<Photo>, required: true }
})

const shareUIRef = ref<InstanceType<typeof ShareUI>>()
const photosFullsizeRef = ref<InstanceType<typeof PhotosFullsize>>()
const handleShare = () => {
  shareUIRef.value?.onShow('PHOTO', props.photo)
}
const handleFullsize = (src: string, title?: string) => {
  photosFullsizeRef.value?.onShow(src, title)
}
</script>

<style lang="scss" scoped>
.info-wrap {
  @apply flex flex-col gap-y-1;

  .info-item {
    @apply flex gap-x-1;
  }

  .info-title {
    @apply text-[14px]/[18px] text-gray-500/80;
  }
}
</style>

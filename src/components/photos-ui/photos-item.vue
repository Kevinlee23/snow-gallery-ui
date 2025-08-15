<template>
  <Transition name="blur-fade" appear>
    <div v-if="isVisible" :class="{ 'flex gap-x-5': layoutActive === 'list' || layoutActive === 'item' }">
      <div class="aspect-[1.5/1] cursor-pointer" :class="{ 'w-[960px]': layoutActive === 'list' || layoutActive === 'item' }">
        <router-link :to="`/p/${photo._id}`" class="block h-full">
          <SnowImage
            :src="photo.imageUrl"
            :alt="photo.title || ''"
            container-class="h-full bg-gray-100 dark:bg-gray-800"
            image-class="h-full w-full object-cover"
          />
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
                <Expand :size="14" class="text-gray-500 hover:text-black" @click="handleFullsize" />
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
  </Transition>

  <ShareUI ref="shareUIRef" />
  <PhotosFullsize ref="photosFullsizeRef" />
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { LayoutType, Photo } from '@/types/photos'

import { ref, onMounted, nextTick } from 'vue'
import { Expand, Share, Camera, Aperture, MapPin } from 'lucide-vue-next'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { SnowImage } from '@/components/snow-image'
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
const handleFullsize = () => {
  photosFullsizeRef.value?.onShow(props.photo.imageUrl, props.photo.title, props.photo.description)
}

// 动画控制
const isVisible = ref(false)
// 组件挂载后触发动画
onMounted(async () => {
  await nextTick()
  // 短暂延迟后显示，创造更好的视觉效果
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
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

// 模糊缓入动画样式
.blur-fade-enter-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.blur-fade-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(20px) scale(0.95);
}

.blur-fade-enter-to {
  opacity: 1;
  filter: blur(0px);
  transform: translateY(0) scale(1);
}

// 为图片添加额外的加载动画
.blur-fade-enter-active img {
  transition: all 0.4s ease-out 0.2s;
}

.blur-fade-enter-from img {
  opacity: 0;
  filter: blur(4px);
  transform: scale(1.05);
}

.blur-fade-enter-to img {
  opacity: 1;
  filter: blur(0px);
  transform: scale(1);
}
</style>

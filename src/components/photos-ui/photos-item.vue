<template>
  <Transition name="blur-fade" appear>
    <div v-if="isVisible" :class="{ 'flex gap-x-5': fullsize }">
      <div class="aspect-[1.5/1] cursor-pointer" :class="{ 'w-full lg:w-[960px]': fullsize }">
        <component
          :is="selectMode ? 'div' : 'router-link'"
          :to="`/p/${photo._id}`"
          class="block h-full w-full"
          :class="{ 'group relative': selectMode }"
          @click="handleSelect"
        >
          <SnowImage
            :src="`${photo.imageUrl}?x-oss-process=image/resize,w_1280/`"
            :alt="photo.title || ''"
            :container-class="['rounded-[4px] w-full h-full bg-gray-100 dark:bg-gray-800', fullsize ? 'flex justify-center' : '']"
            :image-class="['h-full object-cover', fullsize ? '' : 'w-full']"
          />
          <div
            v-if="selectMode"
            class="absolute bottom-2 right-2 hidden rounded-[999px] border-[1px] border-white p-1 group-hover:block"
            :class="{ '!block !border-[#2c9678]': selectPhotos.includes(photo._id) }"
          >
            <Check :size="20" :class="selectPhotos.includes(photo._id) ? 'text-[#2c9678]' : 'text-white'" />
          </div>
        </component>
      </div>

      <div v-if="fullsize" class="hidden flex-1 flex-col gap-y-5 xl:flex">
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
        <div v-if="photo.description" class="info-wrap">
          <div class="info-title">{{ photo.description }}</div>
        </div>
        <div v-if="photo.relatedAlbums && photo.relatedAlbums.length > 0" class="info-wrap">
          <div CLASS="text-gray-500/80 dark:text-gray-400">
            {{ photo.relatedAlbums.length }} CONNECT{{ photo.relatedAlbums.length > 1 ? 'S' : '' }}
          </div>
          <div
            v-for="album in photo.relatedAlbums"
            :key="album._id"
            :class="{ 'hover:bg-gray-500/20': isDarkMode, 'hover:bg-gray-100': !isDarkMode }"
            class="group/related flex w-fit items-center gap-x-1 rounded-[4px] px-2 py-1"
          >
            <router-link :to="`/album/${album._id}`" class="info-title cursor-pointer">{{ album.title }}</router-link>
            <Share
              :size="16"
              class="hidden cursor-pointer text-gray-500 hover:text-black group-hover/related:flex dark:hover:text-white"
              @click="handleShare(album)"
            />
          </div>
        </div>
        <div class="flex gap-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Expand :size="16" class="text-gray-500 hover:text-black dark:hover:text-white" @click="handleFullsize" />
              </TooltipTrigger>
              <TooltipContent side="bottom">预览</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider v-if="globalState.isLoggin">
            <Tooltip>
              <TooltipTrigger>
                <PenTool :size="16" class="text-gray-500 hover:text-black dark:hover:text-white" @click="emit('edit', photo)" />
              </TooltipTrigger>
              <TooltipContent side="bottom">编辑</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Share :size="16" class="text-gray-500 hover:text-black dark:hover:text-white" @click="handleShare()" />
              </TooltipTrigger>
              <TooltipContent side="bottom">分享</TooltipContent>
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
import type { LayoutType, Photo, RelatedAlbum } from '@/types/photos'

import { ref, onMounted, nextTick, computed } from 'vue'
import { Expand, Share, Camera, Aperture, MapPin, Check, PenTool } from 'lucide-vue-next'
import { SnowImage } from '@/components/snow-image'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { useGlobalState } from '@/hooks/use-global-state'
import { usePhotosState } from '@/hooks/use-photos-state'
import PhotosFullsize from './photos-fullsize.vue'
import ShareUI from './share-ui.vue'

const props = defineProps({
  layoutActive: { type: String as PropType<LayoutType>, required: true },
  photo: { type: Object as PropType<Photo>, required: true },
  selectMode: { type: Boolean, default: false },
  selectPhotos: { type: Array as PropType<string[]>, default: () => [] }
})

const emit = defineEmits(['select', 'edit'])

const { globalState } = useGlobalState()
const { isDarkMode } = usePhotosState()

const shareUIRef = ref<InstanceType<typeof ShareUI>>()
const handleShare = (related?: RelatedAlbum) => {
  if (related) {
    shareUIRef.value?.onShow('ALBUM', {
      _id: related._id,
      title: related.title,
      total: related.photos?.length || 0,
      cover: related.coverRef.imageUrl
    })
  } else {
    shareUIRef.value?.onShow('PHOTO', props.photo)
  }
}

const photosFullsizeRef = ref<InstanceType<typeof PhotosFullsize>>()
const handleFullsize = () => {
  photosFullsizeRef.value?.onShow(props.photo.imageUrl, props.photo.title, props.photo.description)
}

const handleSelect = () => {
  if (props.selectMode) {
    emit('select', props.photo._id)
  }
}

const fullsize = computed(() => {
  return props.layoutActive === 'list' || props.layoutActive === 'item'
})

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
    @apply text-[14px]/[18px] text-gray-500/80 dark:text-gray-400;
  }
}
</style>

<template>
  <Dialog v-model:open="show">
    <DialogContent class="min-w-[574px] gap-0 bg-white p-4" :hideCloseButton="true" @openAutoFocus="(e) => e.preventDefault()">
      <DialogTitle />
      <DialogDescription />

      <div class="pointer-events-none relative select-none">
        <img :src="coverUrl" alt="photo" class="h-[300px] w-full rounded-t-[12px] object-cover" />
        <div class="absolute left-0 right-0 top-0 p-[20px]">
          <div class="flex items-center gap-[10px] text-[24px] text-white">
            <component v-if="topTitleIcon" :is="topTitleIcon" class="size-6" />
            {{ topTitle }}
          </div>
        </div>
      </div>
      <div class="mb-[10px] rounded-b-[12px] bg-gray-500/10 p-[10px] text-black">
        <template v-if="shareType === 'PHOTO'">
          <div class="text-[20px] font-bold">{{ content.title }}</div>
          <div class="text-[14px]">{{ content.subTitle }}</div>
          <div class="flex w-full justify-end">
            <router-link
              v-if="content.description && content.locationId"
              :to="`/location/${content.locationId}`"
              class="flex w-fit items-center gap-x-1 text-[14px] hover:font-medium hover:text-black"
            >
              <MapPin class="size-4" />
              {{ content.description }}
            </router-link>
          </div>
        </template>
        <template v-else>
          <div class="text-[20px] font-bold">{{ content.title }}</div>
          <div class="text-right text-[14px]">{{ content.description }}</div>
        </template>
      </div>

      <div class="flex items-center gap-[10px]">
        <div class="flex flex-1 items-center overflow-hidden rounded-md border border-input bg-white">
          <div class="relative flex-1 overflow-hidden">
            <Input
              id="share-address"
              :model-value="shareAddress"
              disabled
              class="w-full !cursor-text !border-0 disabled:!text-black disabled:!opacity-100"
            />
            <!-- 模糊样式 -->
            <div class="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
          </div>
          <div class="h-6 w-px bg-border"></div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  class="bg-[oklch(0.985 0.002 247.839)] hover:bg-[oklch(0.985 0.002 247.839)] h-9 rounded-none !border-0 px-3 text-black !shadow-none"
                >
                  <Copy color="#000" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"> 复制 </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline" class="size-[40px] border-gray-500/20 bg-gray-500/10 p-[12px] hover:bg-gray-500/10">
                <Download color="#000" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"> 保存到本地 </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline" class="size-[40px] border-gray-500/20 bg-gray-500/10 p-[12px] hover:bg-gray-500/10">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 256 256"
                  height="18"
                  width="18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z"
                  ></path>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"> 分享到 Twitter </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { ShareType, Photo, FilterIconMapType, FilterType, ShareMapType, FilterMapType, ShareItem } from '@/types/photos'

import { ref } from 'vue'
import { Download, Copy, CalendarDays, Camera, Aperture, Film, MapPin } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

const topTitleIconMap: FilterIconMapType = {
  YEAR: CalendarDays,
  CAMERA: Camera,
  LENS: Aperture,
  ALBUM: Film,
  LOCATION: MapPin
}

const prefix = 'https://gallery.snowinlu.com'
const shareMap: ShareMapType = {
  YEAR: `year`,
  CAMERA: `camera`,
  LENS: `lenses`,
  ALBUM: `album`,
  LOCATION: `location`,
  PHOTO: `p`
}
const totalDescribMap: FilterMapType = {
  YEAR: 'Photos taken in',
  CAMERA: 'Photos taken with',
  LENS: 'Photos taken with',
  ALBUM: 'Photos taken in',
  LOCATION: 'Photos taken in'
}

const shareType = ref<ShareType>()
const shareAddress = ref('')
const coverUrl = ref()
const topTitle = ref('')
const topTitleIcon = ref<any>(null)
const content = ref({
  title: '',
  subTitle: '',
  description: '',
  locationId: ''
})

const show = ref(false)
const onShow = (type: ShareType, item: Photo | ShareItem) => {
  shareType.value = type
  shareAddress.value = `${prefix}/${shareMap[type]}/${item._id}`

  if (type === 'PHOTO') {
    const { camera, focalLength, aperture, ISO, title, shootingTimeAt, location, imageUrl } = item as Photo
    topTitle.value = `${camera ? camera.fullName : ''} ${focalLength ? `${focalLength}mm` : ''} ${aperture ? `ƒ/${aperture}` : ''} ${ISO ? `ISO${ISO}` : ''}`
    content.value = {
      title,
      subTitle: shootingTimeAt || '',
      description: location?.fullName || '',
      locationId: location?._id || ''
    }

    coverUrl.value = imageUrl
  } else {
    const { title, total, cover } = item as ShareItem

    coverUrl.value = cover
    topTitle.value = title
    topTitleIcon.value = topTitleIconMap[type as FilterType]
    content.value = {
      title: `${totalDescribMap[type as FilterType]} ${title}`,
      subTitle: '',
      description: `${total} PHOTOS`,
      locationId: ''
    }
  }

  show.value = true
}

defineExpose({ onShow })
</script>

<style scoped lang="scss"></style>

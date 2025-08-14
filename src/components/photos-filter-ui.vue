<template>
  <div class="py-5">
    <div class="mx-auto flex min-h-[calc(100vh-40px)] w-[960px] flex-col">
      <PhotosHeader
        :layout-active="layoutActive"
        :is-toolbar-fixed="isToolbarFixed"
        @sort="handleSort"
        @search="handleSearch"
        @scrollToTop="handleScrollToTop"
      />

      <div class="my-5 flex items-center justify-between text-[14px]">
        <div class="flex items-center gap-x-2 text-black">
          <component :is="filterIconMap[type]" :size="16" class="text-gray-500/80" />
          {{ filterLabel }}
        </div>

        <div class="flex gap-x-2 text-gray-500/80">
          {{ total }} PHOTOS
          <Share v-if="photos.length > 0" :size="16" class="cursor-pointer hover:text-black" @click="handleShare" />
          <HoverCard v-if="description">
            <HoverCardTrigger>
              <SquarePlus :size="16" class="cursor-pointer text-gray-500/80" />
            </HoverCardTrigger>
            <HoverCardContent>
              <div class="text-[14px] text-gray-500/80">
                {{ description }}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>

      <div class="my-[50px] flex-1">
        <PhotosList :layoutActive="layoutActive" :photos="photos" />
      </div>

      <PhotosFooter :themeActive="themeActive" @theme="handleTheme" />
    </div>

    <SearchUI ref="searchUIRef" />
    <ShareUI ref="shareUIRef" />
  </div>
</template>

<script lang="ts" setup>
import type { FilterIconMapType, FilterType, Photo } from '@/types/photos'
import type { PropType } from 'vue'

import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, Share, Camera, Aperture, Film, MapPin, SquarePlus } from 'lucide-vue-next'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import { useFilterLocal } from '@/hooks/use-filter-local'
import PhotosHeader from '@/components/photos-ui/photos-header.vue'
import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import PhotosList from '@/components/photos-ui/photos-list.vue'
import SearchUI from '@/components/photos-ui/search-ui.vue'
import ShareUI from '@/components/photos-ui/share-ui.vue'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'

const props = defineProps({
  type: { type: String as PropType<FilterType>, default: 'YEAR' },
  description: { type: String as PropType<string>, default: '' },
  // 相簿是有封面的，其他类型，例如年份，相机，镜头，地点，是没有封面的，取相册的第一个代替，如相册没有相片，则不显示分享按钮
  cover: { type: String as PropType<string>, default: '' },
  photos: { type: Array as PropType<Photo[]>, default: () => [] },
  total: { type: Number as PropType<number>, required: true }
})

const { isToolbarFixed, handleScrollToTop } = usePhotosScroll()
const { layoutActive, themeActive, handleSort, handleTheme } = usePhotosState('filter')
const { filterLabel, filterValue } = useFilterLocal(props.type)

// 快捷键逻辑
const { CmdK, listKey, gridKey, ctrlK } = usePhotosKeys()
const searchUIRef = ref<InstanceType<typeof SearchUI>>()
const router = useRouter()
const handleSearch = () => {
  searchUIRef.value?.onShow()
}
watchEffect(() => {
  if (listKey.value) {
    router.push('/photos')
  }
  if (gridKey.value) {
    router.push('/photos')
  }

  if (CmdK.value || ctrlK.value) {
    handleSearch()
  }
})

// 分享逻辑
const shareUIRef = ref<InstanceType<typeof ShareUI>>()
const handleShare = () => {
  shareUIRef.value?.onShow(props.type, {
    _id: filterValue,
    title: filterLabel.value,
    total: props.total,
    cover: props.cover || props.photos[0]?.imageUrl || ''
  })
}

const filterIconMap: FilterIconMapType = {
  YEAR: CalendarDays,
  CAMERA: Camera,
  LENS: Aperture,
  ALBUM: Film,
  LOCATION: MapPin
}
</script>

<style scoped lang="scss"></style>

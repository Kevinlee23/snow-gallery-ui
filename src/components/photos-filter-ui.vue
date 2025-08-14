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
        <div class="flex gap-x-2 text-black">
          <component :is="filterIconMap[props.type]" :size="16" class="text-gray-500/80" />
          {{ filterLabel }}
        </div>

        <div class="flex gap-x-2 text-gray-500/80">
          {{ total }} PHOTOS
          <Share :size="16" class="cursor-pointer hover:text-black" @click="handleShare" />
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

import { ref, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, Share, Camera, Aperture, Film, MapPin } from 'lucide-vue-next'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import PhotosHeader from '@/components/photos-ui/photos-header.vue'
import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import PhotosList from '@/components/photos-ui/photos-list.vue'
import SearchUI from '@/components/photos-ui/search-ui.vue'
import ShareUI from '@/components/photos-ui/share-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'

const props = defineProps({
  type: { type: String as PropType<FilterType>, default: 'YEAR' },
  photos: { type: Array as PropType<Photo[]>, default: () => [] },
  total: { type: Number as PropType<number>, required: true }
})

const { isToolbarFixed, handleScrollToTop } = usePhotosScroll()
const { layoutActive, themeActive, handleSort, handleTheme } = usePhotosState()
const { filterLabel, filterValue } = useFilterLocal(props.type)

layoutActive.value = 'filter'

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
    cover: props.photos[0].imageUrl
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

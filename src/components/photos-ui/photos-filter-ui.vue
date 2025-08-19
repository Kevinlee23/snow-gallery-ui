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
        <component :is="isPages ? 'router-link' : 'div'" :to="filterPageMap[type]" class="flex items-center gap-x-2 text-black">
          <component :is="filterIconMap[type]" :size="16" class="text-gray-500/80" />
          {{ filterLabel }}
        </component>

        <div class="flex items-center gap-x-2 text-gray-500/80">
          {{ total }} PHOTOS
          <HoverCard v-if="description">
            <HoverCardTrigger>
              <SquarePlus :size="16" class="cursor-pointer text-gray-500/80 hover:text-black" />
            </HoverCardTrigger>
            <HoverCardContent>
              <div class="text-[14px] text-gray-500/80">
                {{ description }}
              </div>
            </HoverCardContent>
          </HoverCard>
          <TooltipProvider v-if="type === 'ALBUM' && globalState.isLoggin">
            <Tooltip>
              <TooltipTrigger @click="emit('onAddPhotos')">
                <ImagePlus :size="16" class="cursor-pointer text-gray-500/80 hover:text-black" />
              </TooltipTrigger>
              <TooltipContent side="bottom"> 添加照片 </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Share v-if="photos.length > 0" :size="16" class="cursor-pointer text-gray-500/80 hover:text-black" @click="handleShare" />
              </TooltipTrigger>
              <TooltipContent side="bottom"> 分享 </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div class="my-[50px] flex-1">
        <PhotosList
          :layoutActive="layoutActive"
          :photos="photos"
          :hasNextPage="hasNextPage"
          :isPending="isPending"
          @onFetchNextPage="emit('onFetchNextPage')"
        />
      </div>

      <PhotosFooter :themeActive="themeActive" @theme="handleTheme" />
    </div>

    <SearchUI ref="searchUIRef" />
    <ShareUI ref="shareUIRef" />
  </div>
</template>

<script lang="ts" setup>
import type { FilterType, Photo } from '@/types/photos'
import type { PropType } from 'vue'

import { ref, watchEffect, computed } from 'vue'
import { Share, SquarePlus, ImagePlus } from 'lucide-vue-next'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { filterIconMap, filterPageMap } from '@/constant/filter'
import PhotosHeader from './photos-header.vue'
import PhotosFooter from './photos-footer.vue'
import PhotosList from './photos-list.vue'
import SearchUI from './search-ui.vue'
import ShareUI from './share-ui.vue'
import { useGlobalState } from '@/hooks/use-global-state'

const props = defineProps({
  type: { type: String as PropType<FilterType>, default: 'YEAR' },
  description: { type: String as PropType<string>, default: '' },
  // 相簿是有封面的，其他类型，例如年份，相机，镜头，地点，是没有封面的，取相册的第一个代替，如相册没有相片，则不显示分享按钮
  cover: { type: String as PropType<string>, default: '' },
  photos: { type: Array as PropType<Photo[]>, default: () => [] },
  total: { type: Number as PropType<number>, required: true },
  // 分页参数
  hasNextPage: { type: Boolean, default: false },
  isPending: { type: Boolean, default: false }
})

const emit = defineEmits(['onFetchNextPage', 'onAddPhotos'])

const isPages = computed(() => props.type === 'LOCATION' || props.type === 'ALBUM' || props.type === 'CAMERA')

const { globalState } = useGlobalState()
const { isToolbarFixed, handleScrollToTop } = usePhotosScroll()
const { layoutActive, themeActive, handleSort, handleTheme } = usePhotosState('filter')

// 快捷键逻辑
const { CmdK, ctrlK } = usePhotosKeys()
const searchUIRef = ref<InstanceType<typeof SearchUI>>()
const handleSearch = () => {
  searchUIRef.value?.onShow()
}
watchEffect(() => {
  if (CmdK.value || ctrlK.value) {
    handleSearch()
  }
})

// 分享逻辑
const { filterLabel, filterValue } = useFilterLocal(props.type)
const shareUIRef = ref<InstanceType<typeof ShareUI>>()
const handleShare = () => {
  shareUIRef.value?.onShow(props.type, {
    _id: filterValue,
    title: filterLabel.value,
    total: props.total,
    cover: props.cover || props.photos[0]?.imageUrl || ''
  })
}
</script>

<style scoped lang="scss"></style>

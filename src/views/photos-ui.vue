<template>
  <div class="py-5">
    <div class="mx-auto grid w-[1280px] grid-cols-12 gap-x-12">
      <div :class="{ 'col-span-12': layoutActive === 'list', 'col-span-9': layoutActive === 'grid' }">
        <PhotosHeader
          :layoutActive="layoutActive"
          :isToolbarFixed="isToolbarFixed"
          :sortActive="sortActive"
          @sort="handleSort"
          @search="handleSearch"
          @layout="handleLayout"
          @scrollToTop="handleScrollToTop"
        />

        <div class="my-[50px] min-h-[calc(100vh-202px)]">
          <PhotosList :layoutActive="layoutActive" :photos="photos" />
        </div>

        <div :class="[layoutActive === 'list' ? 'w-[960px]' : 'w-full']">
          <PhotosFooter :themeActive="themeActive" @theme="handleTheme" />
        </div>
      </div>

      <PhotosSide v-if="layoutActive === 'grid'" :filterList="filterList" :total="total" />
    </div>

    <SearchUI ref="searchUiRef" />
  </div>
</template>

<script setup lang="ts">
import type { FilterListType, Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { onMounted, ref, watchEffect } from 'vue'
import PhotosHeader from '@/components/photos-ui/photos-header.vue'
import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import PhotosSide from '@/components/photos-ui/photos-side.vue'
import PhotosList from '@/components/photos-ui/photos-list.vue'
import SearchUI from '@/components/photos-ui/search-ui.vue'
import { usePhotosState } from '@/hooks/usePhotosState'
import { usePhotosSrcoll } from '@/hooks/usePhotosSrcoll'
import { usePhotosKeys } from '@/hooks/usePhotosKeys'
import request from '@/utils/request'
import { mockFilterList } from '@/utils/mock'

// 滚动逻辑和页面状态
const { isToolbarFixed, handleScrollToTop } = usePhotosSrcoll()
const { layoutActive, sortActive, themeActive, handleLayout, handleSort, handleTheme } = usePhotosState()

// 数据请求
const photos = ref<any[]>([])
const total = ref<number>(1)
const filterList = ref<FilterListType[]>()
onMounted(async () => {
  const res: Response<{ list: Photo[]; total: number }> = await request.post('/gallery/photo/list', {})
  photos.value = res.data.list
  total.value = res.data.total

  filterList.value = mockFilterList as FilterListType[]
})

// 快捷键逻辑
const { CmdK, listKey, gridKey, ctrlK } = usePhotosKeys()
const searchUiRef = ref<InstanceType<typeof SearchUI>>()
const handleSearch = () => {
  searchUiRef.value?.onShow()
}
watchEffect(() => {
  if (listKey.value) {
    handleLayout('list')
  }
  if (gridKey.value) {
    handleLayout('grid')
  }

  if (CmdK.value || ctrlK.value) {
    handleSearch()
  }
})
</script>

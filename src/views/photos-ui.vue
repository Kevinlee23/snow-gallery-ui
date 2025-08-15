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
          <PhotosList
            :layoutActive="layoutActive"
            :photos="photos"
            :hasNextPage="hasNextPage"
            :isPending="isPending"
            @onFetchNextPage="fetchNextPage"
          />
        </div>

        <div :class="[layoutActive === 'list' ? 'w-[960px]' : 'w-full']">
          <PhotosFooter :themeActive="themeActive" @theme="handleTheme" />
        </div>
      </div>

      <PhotosSide v-if="layoutActive === 'grid'" :filterList="filterList" :total="total" />
    </div>

    <SearchUI ref="searchUIRef" />
  </div>
</template>

<script setup lang="ts">
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, watchEffect } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import PhotosHeader from '@/components/photos-ui/photos-header.vue'
import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import PhotosSide from '@/components/photos-ui/photos-side.vue'
import PhotosList from '@/components/photos-ui/photos-list.vue'
import SearchUI from '@/components/photos-ui/search-ui.vue'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import { useFilterLocal } from '@/hooks/use-filter-local'
import request from '@/utils/request'

const { isToolbarFixed, handleScrollToTop } = usePhotosScroll()
const { layoutActive, sortActive, themeActive, handleLayout, handleSort, handleTheme } = usePhotosState()
const { filterList } = useFilterLocal('ALL')

// 快捷键逻辑
const { CmdK, listKey, gridKey, ctrlK } = usePhotosKeys()
const searchUIRef = ref<InstanceType<typeof SearchUI>>()
const handleSearch = () => {
  searchUIRef.value?.onShow()
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

// 数据请求
const total = ref<number>(1)
const photos = ref<Photo[]>([])
const limit = 16
const fetchPhotos = async (page: number = 1) => {
  const res: Response<{ list: Photo[]; total: number }> = await request.post('/gallery/photo/list', {
    limit,
    sort: [{ field: 'createTime', order: 'desc' }],
    offset: page - 1
  })

  total.value = res.data.total
  return res.data.list
}
const { data, isPending, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: ['photos'],
  queryFn: ({ pageParam }) => fetchPhotos(pageParam),
  getNextPageParam: (_, pages) => {
    const currentPage = pages.length
    const totalPages = Math.ceil(total.value / limit)
    return currentPage < totalPages ? currentPage + 1 : undefined
  },
  initialPageParam: 1
})
watchEffect(() => {
  photos.value = data.value?.pages.flat() || []
})
</script>

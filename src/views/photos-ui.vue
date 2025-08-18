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
          @login="handleLogin"
          @photoUpload="handleUpload"
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

    <PhotoUploadSheet ref="photoUploadRef" @submit="handleUploadSubmit" />
    <SearchUI ref="searchUIRef" />
    <LoginSheet ref="loginRef" @submit="handleLoginSubmit" />
  </div>
</template>

<script setup lang="ts">
import type { Photo, PhotoCreate } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, watchEffect, computed } from 'vue'
import { toast } from 'vue-sonner'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import PhotosHeader from '@/components/photos-ui/photos-header.vue'
import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import PhotosSide from '@/components/photos-ui/photos-side.vue'
import PhotosList from '@/components/photos-ui/photos-list.vue'
import SearchUI from '@/components/photos-ui/search-ui.vue'
import LoginSheet from '@/components/sheet/login-sheet.vue'
import PhotoUploadSheet from '@/components/sheet/photo-upload-sheet.vue'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { useGlobalState } from '@/hooks/use-global.state'
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

const loginRef = ref<InstanceType<typeof LoginSheet>>()
const handleLogin = () => {
  loginRef.value?.handleLogin()
}
const { handleLoginSubmit } = useGlobalState()

const photoUploadRef = ref<InstanceType<typeof PhotoUploadSheet>>()
const handleUpload = () => {
  photoUploadRef.value?.handleUpload()
}
const queryClient = useQueryClient()
const handleUploadSubmit = async (values: PhotoCreate) => {
  // 过滤掉空字符串值
  const filteredValues = Object.fromEntries(Object.entries(values).filter(([_, value]) => value !== ''))

  const res: Response<Photo> = await request.post('/gallery/photo/create', filteredValues)

  toast.success(res.message)

  // 手动触发重新拉取数据
  await queryClient.refetchQueries({ queryKey: ['photos', sortActive] })
}

// 数据请求
const total = ref<number>(1)
const photos = ref<Photo[]>([])
const limit = 16
const orderFileds = computed(() => {
  // 创建时间排序
  if (sortActive.value === 'createdTimeDesc') {
    return [{ field: 'createTime', order: 'desc' }]
  }
  if (sortActive.value === 'createdTimeAsc') {
    return [{ field: 'createTime', order: 'asc' }]
  }
  // 拍摄时间排序，先按拍摄时间排序，再按创建时间排序
  if (sortActive.value === 'shootingTimeDesc') {
    return [
      { field: 'shootingTimeAt', order: 'desc' },
      { field: 'createTime', order: 'desc' }
    ]
  }
  return [
    { field: 'shootingTimeAt', order: 'asc' },
    { field: 'createTime', order: 'asc' }
  ]
})
const fetchPhotos = async (page: number = 1) => {
  const res: Response<{ list: Photo[]; total: number }> = await request.post('/gallery/photo/list', {
    limit,
    sort: [...orderFileds.value],
    offset: page - 1
  })

  total.value = res.data.total
  return res.data.list
}
const { data, isPending, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: ['photos', sortActive],
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

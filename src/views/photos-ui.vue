<template>
  <div class="w-full py-5">
    <div class="mx-auto grid w-full grid-cols-12 px-5 lg:gap-x-12 2xl:w-[1280px] 2xl:px-0">
      <div ref="mainWrapRef" class="col-span-12" :class="{ 'lg:col-span-9': layoutActive === 'grid' }">
        <PhotosHeader
          :mainWrapWidth="width"
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

        <div class="my-[50px] sm:min-h-[calc(100vh-202px)]">
          <PhotosList
            :layoutActive="layoutActive"
            :photos="photos"
            :hasNextPage="hasNextPage"
            :isPending="isPending"
            @onFetchNextPage="fetchNextPage"
          />
        </div>

        <div :class="{ 'w-full': layoutActive === 'grid', 'w-full lg:w-[960px]': layoutActive === 'list' }">
          <PhotosFooter :themeActive="themeActive" @theme="handleTheme" />
        </div>
      </div>

      <div v-if="layoutActive === 'grid'" class="relative col-span-3">
        <PhotosSide class="fixed hidden flex-col lg:flex" :filterList="filterList" :total="total" />
      </div>
    </div>

    <PhotoUploadSheet ref="photoUploadRef" @submit="handleUploadSubmit" @openChange="(sheetShow) => (dialogOrSheetVisible = sheetShow)" />
    <LoginSheet ref="loginRef" @submit="handleLoginSubmit" @openChange="(sheetShow) => (dialogOrSheetVisible = sheetShow)" />
    <PhotosSearch ref="searchUIRef" />
  </div>
</template>

<script setup lang="ts">
import type { Photo, PhotoCreate } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, watchEffect, computed } from 'vue'
import { toast } from 'vue-sonner'
import { useElementSize } from '@vueuse/core'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import { PhotosHeader, PhotosFooter, PhotosSide, PhotosList, PhotosSearch } from '@/components/photos-ui'
import LoginSheet from '@/components/sheet/login-sheet.vue'
import PhotoUploadSheet from '@/components/sheet/photo-upload-sheet.vue'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { useGlobalState } from '@/hooks/use-global-state'
import { useScrollRestoration } from '@/hooks/use-scrollRestoration'
import request from '@/utils/request'
import { filterEmptyFields } from '@/utils/form'

const { isToolbarFixed, handleScrollToTop } = usePhotosScroll()
const { layoutActive, sortActive, themeActive, handleLayout, handleSort, handleTheme } = usePhotosState()
const { filterList } = useFilterLocal('ALL')

// grid布局时，计算 header fixed 时的宽度 （等于主容器宽度）
const mainWrapRef = ref<HTMLElement>()
const { width } = useElementSize(mainWrapRef)

// 快捷键逻辑
const { CmdK, listKey, gridKey, ctrlK, dialogOrSheetVisible } = usePhotosKeys()
const searchUIRef = ref<InstanceType<typeof PhotosSearch>>()
const handleSearch = () => {
  searchUIRef.value?.onShow()
}
watchEffect(() => {
  if (listKey.value && !dialogOrSheetVisible.value) {
    handleLayout('list')
  }
  if (gridKey.value && !dialogOrSheetVisible.value) {
    handleLayout('grid')
  }

  if ((CmdK.value || ctrlK.value) && !dialogOrSheetVisible.value) {
    handleSearch()
  }
})

// 登录逻辑
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
  const filteredValues = filterEmptyFields(values)

  const res: Response<Photo> = await request.post('/gallery/photo/create', filteredValues)
  toast.success(res.message)

  // 手动触发重新拉取数据
  await queryClient.refetchQueries({ queryKey: ['photos', sortActive] })
}

// 数据请求
const total = ref<number>(1)
const photos = ref<Photo[]>([])
const limit = 24
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

  return {
    list: res.data.list,
    total: res.data.total
  }
}
const { data, isPending, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: ['photos', sortActive],
  queryFn: ({ pageParam }) => fetchPhotos(pageParam),
  getNextPageParam: (lastPage, allPages) => {
    const currentPage = allPages.length
    const totalPages = Math.ceil(lastPage.total / limit) // 用 lastPage.total
    total.value = lastPage.total
    return currentPage < totalPages ? currentPage + 1 : undefined
  },
  initialPageParam: 1,
  staleTime: 1000 * 60 * 5 // 5分钟不过期
})
// 将分页数据扁平化
watchEffect(() => {
  photos.value = data.value?.pages.flatMap((p) => p.list) || []
})
useScrollRestoration('photo-list')
</script>

<template>
  <div class="py-5 sm:min-h-screen">
    <div class="mx-auto w-full px-[10px] md:px-5 xl:w-[1280px] xl:px-0">
      <PhotosHeader
        :layout-active="layoutActive"
        :is-toolbar-fixed="isToolbarFixed"
        @sort="handleSort"
        @search="handleSearch"
        @scrollToTop="handleScrollToTop"
      />

      <div class="my-[50px] sm:min-h-[640px]">
        <PhotosItem v-if="photo" :layoutActive="layoutActive" :photo="photo" @edit="handleEdit" />
      </div>
      <PhotosFooter class="w-full lg:w-[960px]" :themeActive="themeActive" @theme="handleTheme" />
    </div>

    <PhotosSearch ref="searchUIRef" />
  </div>
</template>

<script lang="ts" setup>
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PhotosHeader, PhotosItem, PhotosFooter, PhotosSearch } from '@/components/photos-ui'
import PhotoUploadSheet from '@/components/sheet/photo-upload-sheet.vue'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import request from '@/utils/request'

const { isToolbarFixed, handleScrollToTop } = usePhotosScroll()
const { layoutActive, themeActive, handleSort, handleTheme } = usePhotosState('item')

// 快捷键逻辑
const { CmdK, ctrlK } = usePhotosKeys()
const searchUIRef = ref<InstanceType<typeof PhotosSearch>>()
const handleSearch = () => {
  searchUIRef.value?.onShow()
}
watchEffect(() => {
  if (CmdK.value || ctrlK.value) {
    handleSearch()
  }
})

const init = async () => {
  const res: Response<Photo> = await request.get(`/gallery/photo/info/${photoId}`)
  photo.value = res.data
}

const photoUploadRef = ref<InstanceType<typeof PhotoUploadSheet>>()
const handleEdit = () => {
  photoUploadRef.value?.handleUpload(photo.value)
}

const route = useRoute()
const photoId = route.params.id
const photo = ref<Photo>()
onMounted(init)
</script>

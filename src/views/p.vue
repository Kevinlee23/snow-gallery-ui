<template>
  <div class="min-h-screen py-5 dark:bg-black dark:text-white">
    <div class="mx-auto w-[1280px]">
      <PhotosHeader
        :layout-active="layoutActive"
        :is-toolbar-fixed="isToolbarFixed"
        @sort="handleSort"
        @search="handleSearch"
        @scrollToTop="handleScrollToTop"
      />

      <div class="my-[50px] min-h-[640px]">
        <PhotosItem v-if="photo" :layoutActive="layoutActive" :photo="photo" @edit="handleEdit" />
      </div>
      <PhotosFooter :themeActive="themeActive" @theme="handleTheme" />
    </div>

    <PhotoUploadSheet ref="photoUploadRef" @submit="handleUploadSubmit" />
    <SearchUI ref="searchUIRef" />
  </div>
</template>

<script lang="ts" setup>
import type { Photo, PhotoCreate } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import PhotosHeader from '@/components/photos-ui/photos-header.vue'
import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import PhotosItem from '@/components/photos-ui/photos-item.vue'
import SearchUI from '@/components/photos-ui/search-ui.vue'
import PhotoUploadSheet from '@/components/sheet/photo-upload-sheet.vue'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import request from '@/utils/request'
import { filterEmptyFields } from '@/utils/form'

const { isToolbarFixed, handleScrollToTop } = usePhotosScroll()
const { layoutActive, themeActive, handleSort, handleTheme } = usePhotosState('item')

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

const init = async () => {
  const res: Response<Photo> = await request.get(`/gallery/photo/info/${photoId}`)
  photo.value = res.data
}

const photoUploadRef = ref<InstanceType<typeof PhotoUploadSheet>>()
const handleEdit = () => {
  photoUploadRef.value?.handleUpload(photo.value)
}
const handleUploadSubmit = async (values: PhotoCreate) => {
  const filteredValues = filterEmptyFields(values)
  const res: Response<null> = await request.post(`/gallery/photo/update`, filteredValues)
  toast.success(res.message)

  await init()
}

const route = useRoute()
const photoId = route.params.id
const photo = ref<Photo>()
onMounted(init)
</script>

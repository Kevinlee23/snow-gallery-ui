<template>
  <div class="py-5">
    <div class="mx-auto w-[1280px]">
      <PhotosHeader
        :layout-active="layoutActive"
        :is-toolbar-fixed="isToolbarFixed"
        @sort="handleSort"
        @search="handleSearch"
        @scrollToTop="handleScrollToTop"
      />

      <div class="my-[50px]">
        <PhotosItem v-if="photo" :layoutActive="layoutActive" :photo="photo" />
        <Skeleton v-else class="aspect-[1.5/1] w-[980px]" />
      </div>
      <PhotosFooter :themeActive="themeActive" @theme="handleTheme" />
    </div>

    <SearchUI ref="searchUIRef" />
  </div>
</template>

<script lang="ts" setup>
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, watchEffect, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PhotosHeader from '@/components/photos-ui/photos-header.vue'
import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import PhotosItem from '@/components/photos-ui/photos-item.vue'
import SearchUI from '@/components/photos-ui/search-ui.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { usePhotosScroll } from '@/hooks/use-photos-scroll'
import { usePhotosState } from '@/hooks/use-photos-state'
import { usePhotosKeys } from '@/hooks/use-photos-keys'
import request from '@/utils/request'

const { isToolbarFixed, handleScrollToTop } = usePhotosScroll()
const { layoutActive, themeActive, handleSort, handleTheme } = usePhotosState('item')

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

const route = useRoute()
const photoId = route.params.id
const photo = ref<Photo>()
onMounted(async () => {
  const res: Response<Photo> = await request.get(`/gallery/photo/info/${photoId}`)
  photo.value = res.data
})
</script>

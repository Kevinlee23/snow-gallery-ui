<template>
  <PhotosFilterUI type="ALBUM" :cover="cover" :photos="photos" :total="total" :description="description" />
</template>

<script setup lang="ts">
import type { Album } from '@/types/album'
import type { Response } from '@/types/response'

import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import PhotosFilterUI from '@/components/photos-filter-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'

const { filterList, filterValue, getFilterList } = useFilterLocal('ALBUM')

// 数据请求
const photos = ref<any[]>([])
const cover = ref<string>('')
const description = ref<string>('')
const total = ref<number>(1)
onMounted(async () => {
  const albumRes: Response<Album> = await request.post('gallery/album/content', { _id: filterValue })

  cover.value = albumRes.data.coverRef.imageUrl || ''
  photos.value = albumRes.data.photos || []
  total.value = albumRes.data.photos?.length || 0
  description.value = albumRes.data.description || ''

  if (filterList.value.length === 0) {
    await getFilterList()
  }
})
</script>

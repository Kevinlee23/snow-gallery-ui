<template>
  <PhotosFilterUI type="LOCATION" :photos="photos" :total="total" />
</template>

<script setup lang="ts">
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import PhotosFilterUI from '@/components/photos-filter-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'

const { filterList, getFilterList } = useFilterLocal('LOCATION')

// 数据请求
const photos = ref<any[]>([])
const total = ref<number>(1)
onMounted(async () => {
  const res: Response<{ list: Photo[]; total: number }> = await request.post('/gallery/photo/list', {})

  photos.value = res.data.list
  total.value = res.data.total

  if (filterList.value.length === 0) {
    await getFilterList()
  }
})
</script>

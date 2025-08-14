<template>
  <PhotosFilterUI type="YEAR" :photos="photos" :total="total" />
</template>

<script setup lang="ts">
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import PhotosFilterUI from '@/components/photos-filter-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'

const { filterList, filterValue, getFilterList } = useFilterLocal('YEAR')

// 数据请求
const photos = ref<any[]>([])
const total = ref<number>(1)
onMounted(async () => {
  // FIXME: 后端增加条件
  const res: Response<{ list: Photo[]; total: number }> = await request.post('/gallery/photo/list', { year: filterValue })

  photos.value = res.data.list
  total.value = res.data.total

  if (filterList.value.length === 0) {
    await getFilterList()
  }
})
</script>

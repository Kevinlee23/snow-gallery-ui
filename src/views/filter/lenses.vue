<template>
  <PhotosFilterUI title="24-200mm f/4.0-5.6" type="LENS" :photos="photos" :total="total" />
</template>

<script setup lang="ts">
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import PhotosFilterUI from '@/components/photos-filter-ui.vue'

// 数据请求
const photos = ref<any[]>([])
const total = ref<number>(1)
onMounted(async () => {
  const res: Response<{ list: Photo[]; total: number }> = await request.post('/gallery/photo/list', {})

  photos.value = res.data.list
  total.value = res.data.total
})
</script>

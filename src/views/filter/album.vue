<template>
  <PhotosFilterUI
    type="ALBUM"
    :cover="cover"
    :photos="photos"
    :total="total"
    :description="description"
    :hasNextPage="hasNextPage"
    :isPending="isPending"
    @onFetchNextPage="fetchNextPage"
  />
</template>

<script setup lang="ts">
import type { Album } from '@/types/album'
import type { Response } from '@/types/response'

import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import PhotosFilterUI from '@/components/photos-ui/photos-filter-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { useFilterQuery } from '@/hooks/use-filter-query'


const limit = 16
const { filterValue } = useFilterLocal('ALBUM')
const { photos, total, isPending, hasNextPage, fetchNextPage } = useFilterQuery(true, { _id: filterValue }, limit)

const cover = ref<string>('')
const description = ref<string>('')
onMounted(async () => {
  const albumRes: Response<Album> = await request.post('gallery/album/content', { _id: filterValue })
  cover.value = albumRes.data.coverRef.imageUrl || ''
  description.value = albumRes.data.description || ''
})
</script>

<template>
  <PhotosFilterUI type="CAMERA" :photos="photos" :total="total" :hasNextPage="hasNextPage" :isPending="isPending" @onFetchNextPage="fetchNextPage" />
</template>

<script setup lang="ts">
import PhotosFilterUI from '@/components/photos-ui/photos-filter-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { useFilterQuery } from '@/hooks/use-filter-query'

const { filterValue } = useFilterLocal('CAMERA')

const limit = 16
const { photos, total, isPending, hasNextPage, fetchNextPage } = useFilterQuery(
  'camera',
  false,
  { camera: filterValue, sort: [{ order: 1, field: 'shootingTimeAt' }] },
  limit
)
</script>

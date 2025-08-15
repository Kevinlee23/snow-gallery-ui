<template>
  <PhotosFilterUI type="LENS" :photos="photos" :total="total" :hasNextPage="hasNextPage" :isPending="isPending" @onFetchNextPage="fetchNextPage" />
</template>

<script setup lang="ts">
import PhotosFilterUI from '@/components/photos-filter-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { useFilterQuery } from '@/hooks/use-filter-query'


const limit = 16
const { filterValue } = useFilterLocal('LENS')
const { photos, total, isPending, hasNextPage, fetchNextPage } = useFilterQuery(
  false,
  { lenses: filterValue, sort: [{ order: 1, field: 'shootingTimeAt' }] },
  limit
)
</script>

<template>
  <PhotosFilterUI type="YEAR" :photos="photos" :total="total" :hasNextPage="hasNextPage" :isPending="isPending" @onFetchNextPage="fetchNextPage" />
</template>

<script setup lang="ts">
import PhotosFilterUI from '@/components/photos-ui/photos-filter-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { useFilterQuery } from '@/hooks/use-filter-query'


const limit = 24
const { filterValue } = useFilterLocal('YEAR')
const { photos, total, isPending, hasNextPage, fetchNextPage } = useFilterQuery(
  'year',
  false,
  { year: filterValue, sort: [{ order: 1, field: 'shootingTimeAt' }] },
  limit
)
</script>

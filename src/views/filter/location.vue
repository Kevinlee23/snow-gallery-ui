<template>
  <PhotosFilterUI
    type="LOCATION"
    :photos="photos"
    :total="total"
    :hasNextPage="hasNextPage"
    :isPending="isPending"
    @onFetchNextPage="fetchNextPage"
  />
</template>

<script setup lang="ts">
import PhotosFilterUI from '@/components/photos-ui/photos-filter-ui.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { useFilterQuery } from '@/hooks/use-filter-query'

const limit = 16
const { filterValue } = useFilterLocal('LOCATION')
const { photos, total, isPending, hasNextPage, fetchNextPage } = useFilterQuery(
  'location',
  false,
  {
    location: filterValue,
    sort: [
      { field: 'shootingTimeAt', order: 1 },
      { field: 'createTime', order: 1 }
    ]
  },
  limit
)
</script>

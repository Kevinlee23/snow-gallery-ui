<template>
  <PhotosFilter
    type="ALBUM"
    :cover="cover"
    :photos="photos"
    :total="total"
    :description="description"
    :hasNextPage="hasNextPage"
    :isPending="isPending"
    @onFetchNextPage="fetchNextPage"
    @onAddPhotos="handleBeginAdd"
  />

  <Dialog v-model:open="showPhotosDialog">
    <DialogContent
      class="w-[375px] max-w-[375px] sm:!w-[480px] sm:!max-w-[480px] md:!w-[720px] md:!max-w-[720px] xl:!w-[980px] xl:!max-w-[980px] 2xl:!w-[1080px] 2xl:!max-w-[1080px]"
    >
      <DialogHeader>
        <DialogTitle>相片</DialogTitle>
        <DialogDescription> 追加相片 </DialogDescription>
      </DialogHeader>
      <ScrollArea class="h-[500px] pr-4">
        <PhotosList
          :photos="allPhotos"
          :isPending="allIsPending"
          :hasNextPage="allHasNextPage"
          :layoutActive="'grid'"
          :selectMode="true"
          :selectPhotos="selectedPhotos"
          @onFetchNextPage="allFetchNextPage"
          @select="handleSelectPhoto"
        />
      </ScrollArea>

      <DialogFooter>
        <Button variant="outline" @click="showPhotosDialog = false"> 取消 </Button>
        <Button @click="handleConfirmPhotosDialog"> 确定 </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Album } from '@/types/album'
import type { Response } from '@/types/response'

import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useQueryClient } from '@tanstack/vue-query'
import { PhotosList, PhotosFilter } from '@/components/photos-ui'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { useFilterQuery } from '@/hooks/use-filter-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import request from '@/utils/request'

const limit = 24
const { filterValue, filterLabel, updateItem } = useFilterLocal('ALBUM')
const { photos, total, isPending, hasNextPage, fetchNextPage } = useFilterQuery(
  'album',
  true,
  {
    _id: filterValue,
    sort: [
      { field: 'shootingTimeAt', order: 1 },
      { field: 'createTime', order: 1 }
    ]
  },
  limit
)

let allLimit = 48
const {
  photos: allPhotos,
  isPending: allIsPending,
  hasNextPage: allHasNextPage,
  fetchNextPage: allFetchNextPage
} = useFilterQuery('all-photos', false, {}, allLimit)
const showPhotosDialog = ref(false)
const selectedPhotos = ref<string[]>([])
const handleBeginAdd = () => {
  selectedPhotos.value = [...photos.value.map((photo) => photo._id)]
  showPhotosDialog.value = true
}
const handleSelectPhoto = (photoId: string) => {
  if (selectedPhotos.value.includes(photoId)) {
    selectedPhotos.value = selectedPhotos.value.filter((id) => id !== photoId)
  } else {
    selectedPhotos.value.push(photoId)
  }
}
const queryClient = useQueryClient()
const handleConfirmPhotosDialog = async () => {
  const res: Response<Album> = await request.post('gallery/album/updatePhotos', { _id: filterValue, photos: selectedPhotos.value })
  updateItem('ALBUM', filterLabel.value, filterValue, selectedPhotos.value.length)

  toast.success(res.message)
  await queryClient.refetchQueries({ queryKey: ['album'] })
  showPhotosDialog.value = false
}

const cover = ref<string>('')
const description = ref<string>('')
onMounted(async () => {
  const albumRes: Response<Album> = await request.post('gallery/album/content', { _id: filterValue })
  cover.value = albumRes.data.coverRef.imageUrl || ''
  description.value = albumRes.data.description || ''
})
</script>

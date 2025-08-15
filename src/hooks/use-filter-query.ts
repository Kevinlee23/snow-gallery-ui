import type { AllAnyType } from '@/types/common'
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, watchEffect } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import request from '@/utils/request'

export const useFilterQuery = (isAlbum: boolean, query: AllAnyType = {}, limit: number = 16) => {
  const total = ref<number>(0)
  const photos = ref<Photo[]>([])

  const fetchPhotos = async (page: number = 1) => {
    const res: Response<{ list: Photo[]; total: number }> = await request.post(isAlbum ? '/gallery/album/page-photos' : '/gallery/photo/list', {
      ...query,
      limit,
      offset: page - 1
    })

    total.value = res.data.total
    return res.data.list
  }

  const { data, isPending, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['photos'],
    queryFn: ({ pageParam }) => fetchPhotos(pageParam),
    getNextPageParam: (_, pages) => {
      const currentPage = pages.length
      const totalPages = Math.ceil(total.value / limit)
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1
  })

  watchEffect(() => {
    photos.value = data.value?.pages.flat() || []
  })

  return { photos, total, isPending, hasNextPage, fetchNextPage }
}

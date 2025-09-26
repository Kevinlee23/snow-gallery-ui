import type { AllAnyType } from '@/types/common'
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, watchEffect } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import request from '@/utils/request'

export const useFilterQuery = (queryKey: string, isAlbum: boolean, query: AllAnyType = {}, limit: number = 16) => {
  const total = ref<number>(0)
  const photos = ref<Photo[]>([])

  const fetchPhotos = async (page: number = 1) => {
    const res: Response<{ list: Photo[]; total: number }> = await request.post(isAlbum ? '/gallery/album/page-photos' : '/gallery/photo/list', {
      ...query,
      limit,
      offset: page - 1
    })

    return {
      list: res.data.list,
      total: res.data.total
    }
  }

  const { data, isPending, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: ({ pageParam }) => fetchPhotos(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length
      const totalPages = Math.ceil(lastPage.total / limit) // 用 lastPage.total
      total.value = lastPage.total
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5 // 5分钟不过期
  })

  watchEffect(() => {
    photos.value = data.value?.pages.flatMap((p) => p.list) || []
  })

  return { photos, total, isPending, hasNextPage, fetchNextPage }
}

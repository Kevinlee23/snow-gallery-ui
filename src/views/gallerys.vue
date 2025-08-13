<template>
  <div class="mx-auto w-[1280px] py-5">
    <div class="mb-8 flex gap-x-2">
      <DiscAlbum />
      A photographic journal by Snowinlu.
    </div>
    <div class="flex min-h-[calc(100vh-176px)] flex-col gap-y-8">
      <div v-for="item in albumsWithYear" :key="item.year" class="flex gap-x-4">
        <div class="text-[16px] font-medium text-gray-500">{{ item.year }}</div>
        <div class="grid grid-cols-5 gap-4">
          <!-- FIXME: 跳转相册详情页, 使用正确的地址 -->
          <router-link v-for="album in item.albums" :key="album._id" :to="`/`" class="group w-full cursor-pointer">
            <div class="relative mb-2 aspect-[1.5]">
              <img :src="album.coverRef.imageUrl" alt="" class="h-full w-full object-cover" />

              <Share class="share-motion absolute bottom-2 right-10 cursor-pointer" :size="18" @click.prevent="handleShare(album)" />
              <Expand
                class="expand-motion pointer-events-none absolute bottom-2 right-2 cursor-pointer group-hover:pointer-events-auto"
                :size="18"
                @click.prevent="handleShowFullsize(album.coverRef.imageUrl, album.title)"
              />
            </div>
            <div class="relative w-fit text-[14px]">
              {{ album.title }}
              <div class="absolute bottom-0 left-0 h-[1px] w-0 bg-black/80 transition-all duration-300 group-hover:w-full"></div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <ShareUi ref="shareUiRef" />
    <PhotosFullsize ref="photosFullsizeRef" />
    <PhotosFooter class="mt-12 !w-full" :themeActive="themeActive" @theme="handleTheme" />
  </div>
</template>

<script lang="ts" setup>
import type { Album, AlbumsWithYear } from '@/types/album'

import { onMounted, ref } from 'vue'
import { DiscAlbum, Expand, Share } from 'lucide-vue-next'
import { usePhotosState } from '@/hooks/usePhotosState'
import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import PhotosFullsize from '@/components/photos-ui/photos-fullsize.vue'
import ShareUi from '@/components/photos-ui/share-ui.vue'
import request from '@/utils/request'

const { themeActive, handleTheme } = usePhotosState()

const photosFullsizeRef = ref<InstanceType<typeof PhotosFullsize>>()
const handleShowFullsize = (src: string, title?: string) => {
  photosFullsizeRef.value?.onShow(src, title)
}

const shareUiRef = ref<InstanceType<typeof ShareUi>>()
const handleShare = (album: Album) => {
  shareUiRef.value?.onShow('ALBUM', {
    _id: album._id,
    title: album.title,
    total: album.photos?.length || 0,
    cover: album.coverRef.imageUrl
  })
}

const albumsWithYear = ref<AlbumsWithYear[]>([])
onMounted(async () => {
  const res = await request.post('/gallery/album/list', { limit: 50, sort: [{ field: 'createTime', direction: -1 }] })
  // 按年份分组相册数据
  const groupedByYear = res.data.list.reduce((acc: Record<string, any[]>, album: any) => {
    const year = new Date(album.createTime).getFullYear().toString()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(album)
    return acc
  }, {})

  // 转换为 AlbumByYear 格式并按年份倒序排列
  albumsWithYear.value = Object.keys(groupedByYear)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map((year) => ({
      year,
      albums: groupedByYear[year]
    }))
})
</script>

<style lang="scss" scoped>
.expand-motion {
  @apply rotate-[45deg] text-black opacity-0 [transition:opacity_500ms_cubic-bezier(0.33,1,0.68,1),transform_500ms_200ms_cubic-bezier(0.22,1,0.36,1),color_500ms_200ms_cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-0 group-hover:text-white group-hover:opacity-100;
}

.share-motion {
  @apply pointer-events-none translate-y-[150%] text-white opacity-0 [transition:opacity_500ms_cubic-bezier(0.33,1,0.68,1),transform_500ms_200ms_cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100;
}
</style>

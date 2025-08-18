<template>
  <NoToolbarTemplate :icon="DiscAlbum" title="A photographic journal by Snowinlu." class="!w-[1280px]" @create="handleCreate">
    <div class="flex min-h-[calc(100vh-176px)] flex-col gap-y-8">
      <div v-for="item in albumsWithYear" :key="item.year" class="flex gap-x-4">
        <div class="text-[16px] font-medium text-gray-500">{{ item.year }}</div>
        <div class="grid grid-cols-5 gap-4">
          <router-link v-for="album in item.albums" :key="album._id" :to="`/album/${album._id}`" class="group w-full cursor-pointer">
            <div class="relative mb-2 aspect-[1.5]">
              <img :src="album.coverRef.imageUrl" alt="" class="h-full w-full object-cover" />

              <Share class="share-motion absolute bottom-2 right-10 cursor-pointer" :size="18" @click.prevent="handleShare(album)" />
              <Expand
                class="expand-motion pointer-events-none absolute bottom-2 right-2 cursor-pointer group-hover:pointer-events-auto"
                :size="18"
                @click.prevent="handleShowFullsize(album.coverRef.imageUrl, album.title, album.description)"
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

    <ShareUI ref="shareUIRef" />
    <PhotosFullsize ref="photosFullsizeRef" />
    <AlbumSheet ref="albumSheetRef" @submit="handleSubmit" @openChange="(sheetShow) => (dialogOrSheetVisible = sheetShow)" />
  </NoToolbarTemplate>
</template>

<script lang="ts" setup>
import type { Album, AlbumCreate, AlbumsWithYear } from '@/types/album'
import type { Response } from '@/types/response'

import { onMounted, ref } from 'vue'
import { DiscAlbum, Expand, Share } from 'lucide-vue-next'
import PhotosFullsize from '@/components/photos-ui/photos-fullsize.vue'
import ShareUI from '@/components/photos-ui/share-ui.vue'
import AlbumSheet from '@/components/sheet/album-sheet.vue'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import request from '@/utils/request'
import { usePhotosKeys } from '@/hooks/use-photos-keys'

const { dialogOrSheetVisible } = usePhotosKeys()

const photosFullsizeRef = ref<InstanceType<typeof PhotosFullsize>>()
const handleShowFullsize = (src: string, title?: string, desc?: string) => {
  photosFullsizeRef.value?.onShow(src, title, desc)
}

const shareUIRef = ref<InstanceType<typeof ShareUI>>()
const handleShare = (album: Album) => {
  shareUIRef.value?.onShow('ALBUM', {
    _id: album._id,
    title: album.title,
    total: album.photos?.length || 0,
    cover: album.coverRef.imageUrl
  })
}

const albumsWithYear = ref<AlbumsWithYear[]>([])
onMounted(async () => {
  const res: Response<{ list: Album[]; total: number }> = await request.post('/gallery/album/list', {
    limit: 50,
    sort: [{ field: 'createTime', order: -1 }]
  })
  // 按年份分组相册数据
  const groupedByYear = res.data.list.reduce(
    (acc: Record<string, Album[]>, album: Album) => {
      const year = new Date(album.createTime).getFullYear().toString()
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(album)
      return acc
    },
    {} as Record<string, Album[]>
  )

  // 转换为 AlbumByYear 格式并按年份倒序排列
  albumsWithYear.value = Object.keys(groupedByYear)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map((year) => ({
      year,
      albums: groupedByYear[year]
    }))
})

const albumSheetRef = ref<InstanceType<typeof AlbumSheet>>()
const handleCreate = () => {
  albumSheetRef.value?.handleOpen()
}
const handleSubmit = (values: AlbumCreate) => {
}
</script>

<style lang="scss" scoped>
.expand-motion {
  @apply rotate-[45deg] text-black opacity-0 [transition:opacity_500ms_cubic-bezier(0.33,1,0.68,1),transform_500ms_200ms_cubic-bezier(0.22,1,0.36,1),color_500ms_200ms_cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-0 group-hover:text-white group-hover:opacity-100;
}

.share-motion {
  @apply pointer-events-none translate-y-[150%] text-white opacity-0 [transition:opacity_500ms_cubic-bezier(0.33,1,0.68,1),transform_500ms_200ms_cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100;
}
</style>

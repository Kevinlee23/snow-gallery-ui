<template>
  <NoToolbarTemplate :icon="DiscAlbum" title="A photographic journal by Snowinlu." contentClass="w-full xl:!w-[1280px]" @create="handleAlbumEdit">
    <div class="flex flex-col gap-y-8 sm:min-h-[calc(100vh-176px)]">
      <div v-for="item in albumsWithYear" :key="item.year" class="flex gap-x-4">
        <div class="text-[16px] font-medium text-gray-500 dark:text-white">{{ item.year }}</div>
        <div class="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <router-link v-for="album in item.albums" :key="album._id" :to="`/album/${album._id}`" class="group h-full w-full cursor-pointer">
            <Transition name="blur-fade" appear>
              <div class="relative mb-2 aspect-[1.5] h-auto w-full">
                <SnowImage
                  :src="`${album.coverRef.imageUrl}?x-oss-process=image/resize,w_1280/`"
                  :alt="album.title"
                  containerClass="rounded-[4px] absolute inset-0 h-full w-full bg-gray-100 dark:bg-gray-800"
                  imageClass="h-full w-full object-cover"
                />

                <PenTool
                  v-if="globalState.isLoggin"
                  class="motion-init motion-after edit-motion absolute bottom-2 right-[72px] cursor-pointer"
                  :size="18"
                  @click.prevent="handleAlbumEdit(album)"
                />
                <Share
                  class="motion-init motion-after share-motion absolute bottom-2 right-10 cursor-pointer"
                  :size="18"
                  @click.prevent="handleShare(album)"
                />
                <Expand
                  class="motion-init motion-after expand-motion absolute bottom-2 right-2 cursor-pointer"
                  :size="18"
                  @click.prevent="handleShowFullsize(album.coverRef.imageUrl, album.title, album.description)"
                />

                <EyeOff v-if="album.public === '0'" class="absolute right-2 top-2 cursor-pointer text-white" :size="18" />
              </div>
            </Transition>

            <div class="relative w-fit text-[14px]">
              {{ album.title }}
              <div class="absolute bottom-0 left-0 h-[1px] w-0 bg-black/80 transition-all duration-300 group-hover:w-full"></div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <PhotosShare ref="shareUIRef" />
    <PhotosFullsize ref="photosFullsizeRef" />
    <AlbumSheet ref="albumSheetRef" @submit="handleSubmit" @delete="handleDelete" />
  </NoToolbarTemplate>
</template>

<script lang="ts" setup>
import type { Album, AlbumCreate, AlbumsWithYear } from '@/types/album'
import type { Response } from '@/types/response'

import { onMounted, ref } from 'vue'
import { DiscAlbum, Expand, EyeOff, PenTool, Share } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { PhotosFullsize, PhotosShare } from '@/components/photos-ui'
import AlbumSheet from '@/components/sheet/album-sheet.vue'
import { SnowImage } from '@/components/snow-image'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import { useGlobalState } from '@/hooks/use-global-state'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { filterEmptyFields } from '@/utils/form'
import request from '@/utils/request'

const { globalState } = useGlobalState()

const photosFullsizeRef = ref<InstanceType<typeof PhotosFullsize>>()
const handleShowFullsize = (src: string, title?: string, desc?: string) => {
  photosFullsizeRef.value?.onShow(src, title, desc)
}

const shareUIRef = ref<InstanceType<typeof PhotosShare>>()
const handleShare = (album: Album) => {
  shareUIRef.value?.onShow('ALBUM', {
    _id: album._id,
    title: album.title,
    total: album.photos?.length || 0,
    cover: album.coverRef.imageUrl
  })
}

const albumsWithYear = ref<AlbumsWithYear[]>([])
const albumInit = async () => {
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
}
onMounted(async () => {
  await albumInit()
})

const { addNewIttem, updateItem, removeItem } = useFilterLocal('ALBUM')
const albumSheetRef = ref<InstanceType<typeof AlbumSheet>>()
const handleAlbumEdit = (album?: Album) => {
  albumSheetRef.value?.handleOpen(album)
}
const handleSubmit = async (values: AlbumCreate) => {
  const filteredValues = filterEmptyFields(values) as AlbumCreate
  const countPhotos = Array.from(new Set<string>([filteredValues.coverRef as unknown as string, ...(filteredValues.photos as string[])]))

  let res: Response<null | string>
  if (values._id) {
    res = await request.post('/gallery/album/update', filteredValues)

    updateItem('ALBUM', filteredValues.title, values._id, countPhotos.length)
  } else {
    res = await request.post('/gallery/album/create', filteredValues)
    addNewIttem('ALBUM', filteredValues.title, res.data as string, countPhotos.length)
  }

  toast.success(res.message)

  await albumInit()
}
const handleDelete = async (id: string) => {
  const res: Response<null> = await request.post('/gallery/album/delete', { _id: id })
  toast.success(res.message)
  await albumInit()

  removeItem('ALBUM', id)
}
</script>

<style lang="scss" scoped>
.motion-init {
  @apply translate-y-[150%] text-white opacity-0 dark:text-black;
}

.motion-after {
  @apply group-hover:translate-y-0 group-hover:opacity-100 dark:group-hover:text-white;
}

.expand-motion {
  @apply [transition:opacity_500ms_cubic-bezier(0.33,1,0.68,1),transform_500ms_200ms_cubic-bezier(0.22,1,0.36,1),color_500ms_600ms_cubic-bezier(0.33,1,0.68,1)];
}

.share-motion {
  @apply [transition:opacity_500ms_cubic-bezier(0.33,1,0.68,1),transform_500ms_400ms_cubic-bezier(0.22,1,0.36,1),color_500ms_600ms_cubic-bezier(0.33,1,0.68,1)];
}

.edit-motion {
  @apply [transition:opacity_500ms_cubic-bezier(0.33,1,0.68,1),transform_500ms_600ms_cubic-bezier(0.22,1,0.36,1),color_500ms_600ms_cubic-bezier(0.33,1,0.68,1)];
}
</style>

<template>
  <Dialog v-model:open="show">
    <DialogContent class="!top-[20%] max-w-2xl translate-y-0 gap-0 p-0" :class="{ 'bg-black': isDarkMode }" :hideCloseButton="true">
      <DialogTitle />
      <DialogDescription />

      <!-- 搜索框 Header -->
      <div class="flex items-center gap-x-2 border-b px-4 py-3">
        <div class="relative flex-1">
          <!-- 搜索图标 -->
          <span class="absolute inset-y-0 start-0 flex items-center justify-center px-2">
            <Search :class="{ 'text-gray-400': !isDarkMode, 'text-gray-500/80': isDarkMode }" class="size-6" />
          </span>
          <!-- 搜索输入框 -->
          <Input
            v-model="searchValue"
            class="border-none bg-transparent pl-10 text-base shadow-none focus:border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            :class="{
              'text-black placeholder-gray-400': !isDarkMode,
              'text-white placeholder-gray-500/80': isDarkMode
            }"
            placeholder="搜索相片、相簿、相机型号、镜头型号、拍摄地点..."
            autofocus
          />
        </div>

        <!-- ESC 关闭按钮 -->
        <div
          v-show="searchValue"
          class="close-button flex h-[28px] w-[41.5px] items-center justify-center"
          :class="{
            'bg-gray-100 text-gray-400 hover:bg-gray-200': !isDarkMode,
            'bg-black text-white hover:bg-gray-500/80': isDarkMode,
            '!cursor-default border-none hover:bg-transparent': searching
          }"
          @click="!searching && (searchValue = '')"
        >
          <LoaderCircle v-if="searching" :size="18" class="animate-spin" />
          <X v-else :size="18" />
        </div>
        <DialogClose asChild>
          <div
            v-show="!searchValue"
            class="close-button px-2 py-1 text-[12px] font-medium"
            :class="{ 'bg-gray-100 text-gray-400 hover:bg-gray-200': !isDarkMode, 'bg-black text-white hover:bg-gray-500/80': isDarkMode }"
          >
            ESC
          </div>
        </DialogClose>
      </div>

      <!-- 内容区域 -->
      <ScrollArea class="max-h-[320px] p-4">
        <div v-if="!searchValue" class="flex flex-col gap-y-4">
          <div v-for="item in filterList" :key="item.type">
            <div class="tag-title" :class="{ 'text-gray-500': !isDarkMode, 'text-white': isDarkMode }">
              <component :is="filterIconMap[item.type]" class="mr-2" :size="14" />
              {{ filterMap[item.type] }}
            </div>
            <div class="space-y-2">
              <router-link
                v-for="filterItem in item.list"
                :key="filterItem.value"
                :to="`${filterLinkMap[item.type]}/${filterItem.value}`"
                :class="tagItemClass"
              >
                <span :class="tagNameClass">
                  {{ filterItem.label }}
                </span>
                <span :class="tagSubClass">x {{ filterItem.total }}</span>
              </router-link>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="searching" class="flex items-center justify-center text-[14px]" :class="{ 'text-white': isDarkMode }">加载中...</div>
          <div v-else>
            <div
              v-if="searchGroup.photosCount === 0"
              class="text-center text-[14px]"
              :class="{ 'text-gray-500/80': !isDarkMode, 'text-white': isDarkMode }"
            >
              暂无结果
            </div>
            <div v-else class="flex flex-col gap-y-4">
              <div v-if="searchGroup.PHOTOS">
                <div class="tag-title" :class="{ 'text-gray-500': !isDarkMode, 'text-white': isDarkMode }">
                  <Image class="mr-2" :size="14" />
                  相片
                </div>
                <div class="space-y-2">
                  <router-link v-for="photo in searchGroup.PHOTOS" :key="photo._id" :to="`/p/${photo._id}`" class="!p-2" :class="tagItemClass">
                    <div :class="tagNameClass" class="flex items-center gap-x-2">
                      <img class="h-[30px] w-[50px] rounded-[2px]" :src="`${photo.imageUrl}?x-oss-process=image/resize,w_1280/`" />
                      {{ photo.title }}
                    </div>
                    <span :class="tagSubClass">
                      {{ photo.shootingTimeAt || '' }}
                    </span>
                  </router-link>
                </div>
              </div>
              <div v-for="type in searchGroupkeys" :key="`search-${type}`">
                <template v-if="searchGroup[type as keyof SearchResult]">
                  <div class="tag-title" :class="{ 'text-gray-500': !isDarkMode, 'text-white': isDarkMode }">
                    <component :is="filterIconMap[type as FilterType]" class="mr-2" :size="14" />
                    {{ filterMap[type as FilterType] }}
                  </div>

                  <div class="space-y-2">
                    <router-link
                      v-for="item in searchGroup[type as keyof SearchResult]"
                      :key="item._id"
                      :to="`${filterLinkMap[type as FilterType]}/${item._id}`"
                      :class="tagItemClass"
                    >
                      <span :class="tagNameClass">{{ item.title }}</span>
                      <span :class="tagSubClass">x {{ item.total }}</span>
                    </router-link>
                  </div>
                </template>
              </div>
              <div class="text-center text-[14px]" :class="{ 'text-gray-500/80': !isDarkMode, 'text-white': isDarkMode }">
                {{ searchGroup.photosCount }} PHOTOS
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts" setup>
import type { Response } from '@/types/response'
import type { SearchResult } from '@/types/search'
import type { FilterType } from '@/types/photos'

import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Search, X, Image, LoaderCircle } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import Input from '@/components/ui/input/Input.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { usePhotosState } from '@/hooks/use-photos-state'
import request from '@/utils/request'
import { filterIconMap, filterMap, filterLinkMap } from '@/constant/filter'
import { searchType } from '@/constant/search'

const { isDarkMode } = usePhotosState()
const tagItemClass = computed(() => {
  const basis = 'flex items-center justify-between rounded p-1'

  return `${basis} ${isDarkMode.value ? 'hover:bg-gray-500/20' : 'hover:bg-gray-100'}`
})
const tagNameClass = computed(() => {
  return `text-[14px] ${isDarkMode.value ? 'text-white' : 'text-gray-900'}`
})
const tagSubClass = computed(() => {
  return `text-[12px] ${isDarkMode.value ? 'text-gray-500/80' : 'text-gray-500'}`
})

const { filterList } = useFilterLocal('ALL')

const show = ref(false)
const onShow = () => {
  show.value = true
}

const searchValue = ref('')
const searching = ref(false)
const searchGroup = ref<SearchResult & { photosCount: number }>({ photosCount: 0 })
const searchGroupkeys = computed(() => {
  return Object.keys(searchGroup.value).filter((key) => {
    if (searchType.includes(key)) {
      return true
    }
  })
})
const handleSearch = useDebounceFn(async () => {
  if (searchValue.value) {
    searchGroup.value = { photosCount: 0 }
    const res: Response<SearchResult & { photosCount: number }> = await request.get('/search/all', { params: { query: searchValue.value } })

    searchGroup.value = res.data
  }
  searching.value = false
}, 1000)
watch(searchValue, async (val) => {
  if (val) {
    searching.value = true
    await handleSearch()
  }
})

defineExpose({ onShow })
</script>

<style lang="scss" scoped>
.tag-title {
  @apply mb-3 flex items-center text-[14px]/[18px] font-medium;
}

.close-button {
  @apply cursor-pointer rounded-[4px] border transition-colors;
}
</style>

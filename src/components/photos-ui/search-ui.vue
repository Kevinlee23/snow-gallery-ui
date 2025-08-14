<template>
  <Dialog v-model:open="show">
    <DialogContent class="!top-[20%] max-w-2xl translate-y-0 gap-0 p-0" :hideCloseButton="true">
      <DialogTitle />
      <DialogDescription />

      <!-- 搜索框 Header -->
      <div class="flex items-center gap-x-2 border-b px-4 py-3">
        <div class="relative flex-1">
          <!-- 搜索图标 -->
          <span class="absolute inset-y-0 start-0 flex items-center justify-center px-2">
            <Search class="size-6 text-gray-400" />
          </span>
          <!-- 搜索输入框 -->
          <Input
            v-model="searchValue"
            class="border-none bg-transparent pl-10 text-base text-gray-900 placeholder-gray-400 shadow-none focus:border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="搜索相片、相簿、相机型号、镜头型号、拍摄地点..."
            autofocus
          />
        </div>

        <!-- ESC 关闭按钮 -->
        <div v-show="searchValue" class="close-button flex h-[28px] w-[41.5px] items-center justify-center" @click="searchValue = ''">
          <X :size="18" />
        </div>
        <DialogClose asChild>
          <div v-show="!searchValue" class="close-button px-2 py-1 text-[12px] font-medium">ESC</div>
        </DialogClose>
      </div>

      <!-- 内容区域 -->
      <ScrollArea class="max-h-[320px] p-4">
        <div v-if="!searchValue" class="flex flex-col gap-y-4">
          <div v-for="item in filterList" :key="item.type">
            <div class="tag-title">
              <component :is="filterIconMap[item.type]" class="mr-2" :size="14" />
              {{ filterMap[item.type] }}
            </div>
            <div class="space-y-2">
              <router-link
                v-for="filterItem in item.list"
                :key="filterItem.value"
                :to="`${filterLinkMap[item.type]}/${filterItem.value}`"
                class="tag-item"
              >
                <span class="tag-item-name">{{ filterItem.label }}</span>
                <span class="tag-item-count">x {{ filterItem.total }}</span>
              </router-link>
            </div>
          </div>
        </div>
        <div v-else>
          <!-- FIXME: 对接 main search 接口 -->
          <div class="text-center text-[14px] text-gray-500/80">Result</div>
        </div>
        <!-- FIXME: 使用真实数据 -->
        <div class="text-center text-[14px] text-gray-500/80">358 PHOTOS</div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts" setup>
import type { FilterMapType, FilterIconMapType } from '@/types/photos'

import { ref } from 'vue'
import { Search, Camera, CalendarDays, Aperture, Film, MapPin, X } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import Input from '@/components/ui/input/Input.vue'
import { useFilterLocal } from '@/hooks/use-filter-local'

const filterMap: FilterMapType = {
  YEAR: '拍摄年份',
  CAMERA: '相机型号',
  LENS: '镜头型号',
  ALBUM: '归属相簿',
  LOCATION: '拍摄地点'
}
const filterLinkMap: FilterMapType = {
  YEAR: '/year',
  CAMERA: '/camera',
  LENS: '/lenses',
  ALBUM: '/album',
  LOCATION: '/location'
}
const filterIconMap: FilterIconMapType = {
  YEAR: CalendarDays,
  CAMERA: Camera,
  LENS: Aperture,
  ALBUM: Film,
  LOCATION: MapPin
}

const { filterList } = useFilterLocal('ALL')

const searchValue = ref('')
const show = ref(false)
const onShow = () => {
  show.value = true
}

defineExpose({ onShow })
</script>

<style lang="scss" scoped>
.tag-title {
  @apply mb-3 flex text-[14px]/[18px] font-medium text-gray-500;
}

.tag-item {
  @apply flex cursor-pointer items-center justify-between rounded p-1 hover:bg-gray-100;

  .tag-item-name {
    @apply text-[14px] text-gray-900;
  }

  .tag-item-count {
    @apply text-[12px] text-gray-500/80;
  }
}

.close-button {
  @apply cursor-pointer rounded-[4px] border bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200;
}
</style>

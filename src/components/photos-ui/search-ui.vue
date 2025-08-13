<template>
  <Dialog v-model:open="show">
    <DialogContent class="max-w-2xl gap-0 p-0" :hideCloseButton="true">
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
        <DialogClose asChild>
          <div class="cursor-pointer rounded border bg-gray-100 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-200">ESC</div>
        </DialogClose>
      </div>

      <!-- 内容区域 -->
      <ScrollArea class="h-[320px] p-4">
        <!-- 年份分类 -->
        <div class="mb-4">
          <div class="tag-title">
            <CalendarDays class="mr-2" :size="14" />
            拍摄年份
          </div>
          <div class="space-y-2">
            <div class="tag-item">
              <span class="tag-item-name">2025</span>
              <span class="tag-item-count">x16</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">2024</span>
              <span class="tag-item-count">x26</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">2023</span>
              <span class="tag-item-count">x18</span>
            </div>
          </div>
        </div>

        <!-- 相机分类 -->
        <div class="mb-4">
          <div class="tag-title">
            <Camera class="mr-2" :size="14" />
            相机型号
          </div>
          <div class="space-y-2">
            <div class="tag-item">
              <span class="tag-item-name">NIKON Z30</span>
              <span class="tag-item-count">x347</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">FUJIFILM X-T4</span>
              <span class="tag-item-count">x8</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">IPHONE SE3</span>
              <span class="tag-item-count">x2</span>
            </div>
          </div>
        </div>

        <!-- 镜头分类 -->
        <div class="mb-4">
          <div class="tag-title">
            <Aperture class="mr-2" :size="14" />
            镜头型号
          </div>
          <div class="space-y-2">
            <div class="tag-item">
              <span class="tag-item-name">XF16-55mm f/2.8</span>
              <span class="tag-item-count">x10</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">XF18-80mm f/2.8</span>
              <span class="tag-item-count">x12</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">XF18-55mm f/2.8</span>
              <span class="tag-item-count">x12</span>
            </div>
          </div>
        </div>

        <!-- 相簿 -->
        <div class="mb-4">
          <div class="tag-title">
            <Film class="mr-2" :size="14" />
            归属相簿
          </div>
          <div class="space-y-2">
            <div class="tag-item">
              <span class="tag-item-name">沐沐1岁照</span>
              <span class="tag-item-count">x16</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">精酿酒记</span>
              <span class="tag-item-count">x5</span>
            </div>
          </div>
        </div>

        <!-- 地点 -->
        <div class="mb-4">
          <div class="tag-title">
            <MapPin class="mr-2" :size="14" />
            拍摄地点
          </div>

          <div class="space-y-2">
            <div class="tag-item">
              <span class="tag-item-name">长沙</span>
              <span class="tag-item-count">x10</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">张坊</span>
              <span class="tag-item-count">x12</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">浏阳</span>
              <span class="tag-item-count">x12</span>
            </div>
            <div class="tag-item">
              <span class="tag-item-name">平江</span>
              <span class="tag-item-count">x12</span>
            </div>
          </div>
        </div>

        <div class="text-center text-[14px] text-gray-500/80">358 PHOTOS</div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Search, Camera, CalendarDays, Aperture, Film, MapPin } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import Input from '@/components/ui/input/Input.vue'

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
</style>

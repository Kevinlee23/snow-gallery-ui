<template>
  <div
    :class="[
      'flex items-center justify-between transition-[background,opacity,top,shadow,position,backdrop-filter,border-radius] duration-200',
      layoutActive === 'grid' ? (isToolbarFixed ? 'w-[960px]' : 'w-full') : 'w-[960px]',
      isToolbarFixed ? 'fixed top-5 z-50 rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm' : 'relative top-0'
    ]"
  >
    <div class="flex items-center gap-x-[10px]">
      <!-- 布局切换 -->
      <div
        v-if="!isNotHome"
        class="flex w-fit divide-x divide-gray-500/20 overflow-hidden rounded-[5px] border-[1px] border-gray-500/20 shadow-[0_2px_4px_rgba(0,0,0,0.07)]"
      >
        <router-link to="/photos">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                class="flex h-[28px] w-[42px] cursor-pointer items-center justify-center hover:bg-gray-100/60 hover:text-black"
                :class="layoutActive === 'list' ? '!text-black' : 'text-gray-500/80'"
                @click="handleLayout('list')"
              >
                <Maximize :size="22" :strokeWidth="1" />
              </TooltipTrigger>
              <TooltipContent side="bottom" class="rounded-2 flex items-center">
                列表模式
                <span class="short-key ml-1"> L </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </router-link>
        <router-link to="/photos">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                class="flex h-[28px] w-[42px] cursor-pointer items-center justify-center hover:bg-gray-100/60 hover:text-black"
                :class="layoutActive === 'grid' ? '!text-black' : 'text-gray-500/80'"
                @click="handleLayout('grid')"
              >
                <LayoutGrid :size="22" :strokeWidth="1" />
              </TooltipTrigger>
              <TooltipContent side="bottom" class="rounded-2 flex items-center">
                网格模式
                <span class="short-key ml-1"> G </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </router-link>
      </div>
      <!-- 次要工具栏 -->
      <div class="flex">
        <TooltipProvider v-if="!isNotHome">
          <Tooltip>
            <TooltipTrigger class="group/item secondary-toolbar">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <component
                    :is="sortActive === 'createdTimeDesc' || sortActive === 'shootingTimeDesc' ? ArrowDownWideNarrow : ArrowUpWideNarrow"
                    :size="16"
                    class="text-gray-500 group-hover/item:text-black"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem class="flex cursor-pointer items-center gap-x-2" @click="handleSort('createdTimeDesc')">
                      <Check :size="14" v-if="sortActive === 'createdTimeDesc'" />
                      <div v-else class="w-[16px]"></div>
                      <span :class="[sortActive === 'createdTimeDesc' ? 'text-black' : 'text-gray-500/80']">创建时间最新</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex cursor-pointer items-center gap-x-2" @click="handleSort('createdTimeAsc')">
                      <Check :size="14" v-if="sortActive === 'createdTimeAsc'" />
                      <div v-else class="w-[16px]"></div>
                      <span :class="[sortActive === 'createdTimeAsc' ? 'text-black' : 'text-gray-500/80']">创建时间最旧</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem class="flex cursor-pointer items-center gap-x-2" @click="handleSort('shootingTimeDesc')">
                      <Check :size="14" v-if="sortActive === 'shootingTimeDesc'" />
                      <div v-else class="w-[16px]"></div>
                      <span :class="[sortActive === 'shootingTimeDesc' ? 'text-black' : 'text-gray-500/80']">拍摄时间最新</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex cursor-pointer items-center gap-x-2" @click="handleSort('shootingTimeAsc')">
                      <Check :size="14" v-if="sortActive === 'shootingTimeAsc'" />
                      <div v-else class="w-[16px]"></div>
                      <span :class="[sortActive === 'shootingTimeAsc' ? 'text-black' : 'text-gray-500/80']">拍摄时间最旧</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              排序
              <span class="short-key ml-1">S</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="isNotHome">
          <Tooltip>
            <router-link v-if="isNotHome" to="/photos">
              <TooltipTrigger class="secondary-toolbar">
                <House :size="18" />
              </TooltipTrigger>
            </router-link>
            <TooltipContent side="bottom" class="rounded-2 flex items-center"> 返回首页 </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger class="secondary-toolbar" @click="handleSearch">
              <Search :size="16" />
            </TooltipTrigger>
            <TooltipContent side="bottom" class="rounded-2 flex items-center">
              搜索
              <span class="short-key ml-1">⌘</span>
              <span class="short-key ml-0.5">K</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="!globalState.isLoggin && !isNotHome">
          <Tooltip>
            <TooltipTrigger class="secondary-toolbar" @click="handleLogin">
              <LogIn :size="16" />
            </TooltipTrigger>
            <TooltipContent side="bottom" class="rounded-2 flex items-center"> 登录 </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="globalState.isLoggin && !isNotHome">
          <Tooltip>
            <TooltipTrigger class="secondary-toolbar" @click="handlePhotoUpload">
              <ImageUp :size="16" />
            </TooltipTrigger>
            <TooltipContent side="bottom" class="rounded-2 flex items-center"> 上传相片 </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
    <div v-if="isToolbarFixed" class="cursor-pointer text-gray-500/80 transition-all duration-500 hover:text-black" @click="handleScrollToTop">
      <ArrowBigUp :size="22" />
    </div>
    <router-link v-else to="/" class="cursor-pointer text-[14px] text-black hover:text-gray-500/80">gallery.snowinlu.top</router-link>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { LayoutType, SortType } from '@/types/photos'

import { computed } from 'vue'
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Check, Search, Maximize, LayoutGrid, ArrowBigUp, LogIn, ImageUp, House } from 'lucide-vue-next'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { useGlobalState } from '@/hooks/use-global-state'

const { globalState } = useGlobalState()

const props = defineProps({
  layoutActive: { type: String as PropType<LayoutType>, required: true },
  sortActive: { type: String as PropType<SortType> },
  isToolbarFixed: { type: Boolean as PropType<boolean>, required: true }
})

const emit = defineEmits(['sort', 'search', 'layout', 'scrollToTop', 'login', 'photoUpload'])

const handleSort = (sort: SortType) => {
  emit('sort', sort)
}
const handleSearch = () => {
  emit('search')
}
const handleLayout = (layout: LayoutType) => {
  emit('layout', layout)
}
const handleScrollToTop = () => {
  emit('scrollToTop')
}
const handleLogin = () => {
  emit('login')
}
const handlePhotoUpload = () => {
  emit('photoUpload')
}

const isNotHome = computed(() => props.layoutActive === 'filter' || props.layoutActive === 'item')
</script>

<style lang="scss" scoped>
.short-key {
  @apply rounded-[4px] bg-gray-500/80 px-1 text-[10px] text-white;
}

.secondary-toolbar {
  @apply flex h-[28px] w-[36px] cursor-pointer items-center justify-center rounded-[5px] text-gray-500 hover:bg-gray-100/60 hover:text-black;
}
</style>

<template>
  <div
    :class="[
      'flex items-center justify-between transition-[background,opacity,top,shadow,position,backdrop-filter,border-radius] duration-200',
      layoutActive === 'grid' ? 'w-full' : 'w-[calc(100%-40px)] lg:w-[960px]',
      isToolbarFixed ? 'fixed top-5 z-50 rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm' : 'relative top-0'
    ]"
    :style="getHeaderStyle"
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
                class="text-transition main-toolbar"
                :class="[mainButtonClass('list'), mainButtonDarkClass('list')]"
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
                class="text-transition main-toolbar"
                :class="[mainButtonClass('grid'), mainButtonDarkClass('grid')]"
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
                    :class="secondaryButtonClass"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem class="sort-item" @click="handleSort('createdTimeDesc')">
                      <Check :size="14" v-if="sortActive === 'createdTimeDesc'" />
                      <div v-else class="w-[16px]"></div>
                      <span :class="[sortActive === 'createdTimeDesc' ? 'text-black' : 'text-gray-500/80']">创建时间最新</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="sort-item" @click="handleSort('createdTimeAsc')">
                      <Check :size="14" v-if="sortActive === 'createdTimeAsc'" />
                      <div v-else class="w-[16px]"></div>
                      <span :class="[sortActive === 'createdTimeAsc' ? 'text-black' : 'text-gray-500/80']">创建时间最旧</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem class="sort-item" @click="handleSort('shootingTimeDesc')">
                      <Check :size="14" v-if="sortActive === 'shootingTimeDesc'" />
                      <div v-else class="w-[16px]"></div>
                      <span :class="[sortActive === 'shootingTimeDesc' ? 'text-black' : 'text-gray-500/80']">拍摄时间最新</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem class="sort-item" @click="handleSort('shootingTimeAsc')">
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
              <TooltipTrigger class="secondary-toolbar group/item">
                <House :size="18" :class="secondaryButtonClass" />
              </TooltipTrigger>
            </router-link>
            <TooltipContent side="bottom" class="rounded-2 flex items-center"> 返回首页 </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger class="secondary-toolbar group/item" @click="handleSearch">
              <Search :size="16" :class="secondaryButtonClass" />
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
            <TooltipTrigger class="secondary-toolbar group/item" @click="handleLogin">
              <LogIn :size="16" :class="secondaryButtonClass" />
            </TooltipTrigger>
            <TooltipContent side="bottom" class="rounded-2 flex items-center"> 登录 </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider v-if="globalState.isLoggin && !isNotHome">
          <Tooltip>
            <TooltipTrigger class="secondary-toolbar group/item" @click="handlePhotoUpload">
              <ImageUp :size="16" :class="secondaryButtonClass" />
            </TooltipTrigger>
            <TooltipContent side="bottom" class="rounded-2 flex items-center"> 上传相片 </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
    <div
      v-if="isToolbarFixed"
      class="text-transition cursor-pointer text-gray-500/80 hover:text-black dark:text-gray-500/80 dark:hover:text-black"
      @click="handleScrollToTop"
    >
      <ArrowBigUp :size="22" />
    </div>
    <router-link
      v-else
      to="/"
      class="text-transition hidden cursor-pointer text-[14px] text-black hover:text-gray-500/80 dark:text-white dark:hover:text-gray-500/80 sm:block"
    >
      gallery.snowinlu.top
    </router-link>
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
  // 主容器宽度
  mainWrapWidth: { type: Number as PropType<number>, default: 0 },
  layoutActive: { type: String as PropType<LayoutType>, required: true },
  sortActive: { type: String as PropType<SortType> },
  isToolbarFixed: { type: Boolean as PropType<boolean>, required: true }
})

const emit = defineEmits(['sort', 'search', 'layout', 'scrollToTop', 'login', 'photoUpload'])

// 主按钮样式（list 和 grid 切换）和次按钮（排序、搜索、登录、上传）样式（包含亮色模式和暗色模式）
const mainButtonClass = computed(() => {
  return (type: 'list' | 'grid') => {
    return props.layoutActive === type ? '!text-black' : '!text-gray-500/80 hover:!text-black'
  }
})
const mainButtonDarkClass = computed(() => {
  return (type: 'list' | 'grid') => {
    return props.isToolbarFixed
      ? props.layoutActive === type
        ? 'dark:!text-black'
        : 'dark:text-gray-500/80 dark:hover:!text-black'
      : props.layoutActive === type
        ? 'dark:!text-white'
        : 'dark:text-gray-500/80 dark:hover:!text-white'
  }
})
const secondaryButtonClass = computed(() => {
  const basicClass = 'text-transition text-gray-500/80 group-hover/item:text-black dark:text-gray-500/80'
  const fixed = props.isToolbarFixed ? 'dark:group-hover/item:text-black' : 'dark:group-hover/item:text-white'

  return `${basicClass} ${fixed}`
})

// 主要用来计算 grid 布局下，header fixed 时的宽度
const getHeaderStyle = computed(() => {
  if (props.layoutActive === 'grid' && props.isToolbarFixed) {
    return {
      width: props.mainWrapWidth + 'px'
    }
  }
  return {}
})

// 主要按钮和次要按钮的事件
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

// 判断是否是首页
const isNotHome = computed(() => props.layoutActive === 'filter' || props.layoutActive === 'item')
</script>

<style lang="scss" scoped>
.short-key {
  @apply rounded-[4px] bg-gray-500/80 px-1 text-[10px] text-white;
}

.main-toolbar {
  @apply flex h-[28px] w-[42px] cursor-pointer items-center justify-center hover:bg-gray-100/60 hover:text-black dark:text-gray-400 dark:hover:bg-gray-500/30;
}

.secondary-toolbar {
  @apply flex h-[28px] w-[36px] cursor-pointer items-center justify-center rounded-[5px] text-gray-500 hover:bg-gray-100/60 hover:text-black dark:text-gray-400 dark:hover:bg-gray-500/30;
}

.text-transition {
  @apply transition-[color] duration-300;
}

.sort-item {
  @apply flex cursor-pointer items-center gap-x-2;
}
</style>

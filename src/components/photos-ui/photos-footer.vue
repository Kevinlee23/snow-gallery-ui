<template>
  <div class="flex w-full justify-between">
    <div class="flex items-center text-[14px]">
      <span class="text-nowrap text-gray-500/80">Made with </span>
      <a
        href="https://github.com/Kevinlee23/snow-gallery-ui"
        target="_blank"
        class="m-1 cursor-pointer truncate text-black hover:text-gray-500/80 dark:text-white dark:hover:text-gray-500/80"
      >
        Github@Snow-gallery-ui
      </a>
    </div>

    <div class="mode-trigger-group">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            class="mode-trigger"
            :class="[themeActive === 'system' ? 'text-black dark:text-white' : 'text-gray-500/80']"
            @click="handleTheme('system')"
          >
            <TvMinimal :size="16" />
          </TooltipTrigger>
          <TooltipContent side="top"> 跟随系统 </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            class="mode-trigger"
            :class="[themeActive === 'light' ? 'text-black dark:text-white' : 'text-gray-500/80']"
            @click="handleTheme('light')"
          >
            <Sun :size="16" />
          </TooltipTrigger>
          <TooltipContent side="top"> 亮色模式 </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            class="mode-trigger"
            :class="[themeActive === 'dark' ? 'text-black dark:text-white' : 'text-gray-500/80']"
            @click="handleTheme('dark')"
          >
            <Moon :size="16" />
          </TooltipTrigger>
          <TooltipContent side="top"> 暗色模式 </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { ThemeType } from '@/types/photos'

import { TvMinimal, Sun, Moon } from 'lucide-vue-next'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

defineProps({
  themeActive: { type: String as PropType<ThemeType>, required: true }
})

const emit = defineEmits(['theme'])

const handleTheme = (theme: ThemeType) => {
  emit('theme', theme)
}
</script>
<style lang="scss" scoped>
.mode-trigger-group {
  @apply flex h-[32px] w-[128px] divide-x divide-gray-500/20 overflow-hidden rounded-[5px] border-[1px] border-gray-500/20 shadow-[0_2px_4px_rgba(0,0,0,0.07)];
}

.mode-trigger {
  @apply flex w-[42px] cursor-pointer items-center justify-center bg-white transition-[color] duration-300 hover:bg-gray-100/60 hover:text-black dark:bg-gray-100/30 dark:hover:bg-gray-100/20 dark:hover:text-white;
}
</style>

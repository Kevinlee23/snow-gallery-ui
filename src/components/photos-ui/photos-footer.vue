<template>
  <div class="flex w-[960px] justify-between">
    <div class="flex items-center text-[14px]">
      <span class="text-gray-500/80">Made with </span>
      <a href="https://github.com/Kevinlee23/snow-gallery-ui" target="_blank" class="ml-1 cursor-pointer text-black hover:text-gray-500/80">
        Github@Snow-gallery-ui
      </a>
    </div>

    <div
      class="flex h-[32px] w-[128px] divide-x divide-gray-500/20 overflow-hidden rounded-[5px] border-[1px] border-gray-500/20 shadow-[0_2px_4px_rgba(0,0,0,0.07)]"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            class="flex w-[42px] cursor-pointer items-center justify-center bg-white hover:bg-gray-100/60 hover:text-black"
            :class="[themeActive === 'System' ? 'text-black' : 'text-gray-500/80']"
            @click="handleTheme('System')"
          >
            <TvMinimal :size="16" />
          </TooltipTrigger>
          <TooltipContent side="top"> 跟随系统 </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            class="flex w-[42px] cursor-pointer items-center justify-center bg-white hover:bg-gray-100/60 hover:text-black"
            :class="[themeActive === 'light' ? 'text-black' : 'text-gray-500/80']"
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
            class="flex w-[42px] cursor-pointer items-center justify-center bg-white hover:bg-gray-100/60 hover:text-black"
            :class="[themeActive === 'dark' ? 'text-black' : 'text-gray-500/80']"
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

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { TvMinimal, Sun, Moon } from 'lucide-vue-next'

defineProps({
  themeActive: { type: String as PropType<ThemeType>, required: true }
})

const emit = defineEmits(['theme'])

const handleTheme = (theme: ThemeType) => {
  emit('theme', theme)
}
</script>

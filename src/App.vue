<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import { useGlobalState } from '@/hooks/use-global-state'
import { usePhotosState } from '@/hooks/use-photos-state'

const { globalInit } = useGlobalState()
const { themeActive } = usePhotosState()

const isDarkMode = computed(() => {
  if (themeActive.value === 'system') {
    const currentHour = new Date().getHours()

    // 晚上18点到早上6点使用暗色模式
    return currentHour >= 18 || currentHour < 6
  }

  return themeActive.value === 'dark'
})

onMounted(() => {
  globalInit()
})
</script>

<template>
  <Toaster position="top-center" />
  <div :class="isDarkMode ? 'dark' : ''">
    <RouterView />
  </div>
</template>

<style scoped></style>

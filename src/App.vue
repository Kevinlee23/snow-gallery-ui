<script setup lang="ts">
import { onMounted } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import { useGlobalState } from '@/hooks/use-global-state'
import { usePhotosState } from '@/hooks/use-photos-state'

const { globalInit } = useGlobalState()
const { isDarkMode } = usePhotosState()

onMounted(() => {
  globalInit()
})
</script>

<template>
  <Toaster position="top-center" />
  <div :class="isDarkMode ? 'dark' : ''">
    <div class="min-h-screen w-full dark:bg-black dark:text-white">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>

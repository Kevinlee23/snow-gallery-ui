<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { usePhotosState } from '@/hooks/use-photos-state'

const { isDarkMode } = usePhotosState()
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

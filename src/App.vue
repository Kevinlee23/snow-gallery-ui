<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <Toaster position="top-center" />
  <div>
    <RouterView />
  </div>
</template>

<style scoped></style>

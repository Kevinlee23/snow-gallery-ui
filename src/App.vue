<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { useGlobalState } from '@/hooks/use-global.state'
import { onMounted } from 'vue'

const { globalInit } = useGlobalState()

onMounted(() => {
  globalInit()
})
</script>

<template>
  <Toaster position="top-center" />
  <div>
    <RouterView />
  </div>
</template>

<style scoped></style>

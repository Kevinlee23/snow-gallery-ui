<template>
  <div class="mx-auto flex min-h-[100vh] w-[960px] flex-col py-5">
    <div class="flex justify-between">
      <div class="mb-8 flex gap-x-2">
        <Component :is="icon" />
        {{ title }}
      </div>
      <router-link to="/" class="cursor-pointer text-[14px] text-black hover:text-gray-500/80">gallery.snowinlu.top</router-link>
    </div>

    <slot />

    <PhotosFooter class="mt-12 !w-full" :themeActive="themeActive" @theme="handleTheme" />
  </div>
</template>

<script setup lang="ts">
import type { FunctionalComponent, PropType } from 'vue'
import type { LucideProps } from 'lucide-vue-next'

import PhotosFooter from '@/components/photos-ui/photos-footer.vue'
import { usePhotosState } from '@/hooks/use-photos-state'

defineProps({
  icon: { type: Function as PropType<FunctionalComponent<LucideProps, {}, any, {}>>, required: true },
  title: { type: String, required: true }
})

const { themeActive, handleTheme } = usePhotosState()
</script>

<style scoped lang="scss"></style>

<template>
  <div class="mx-auto flex min-h-[100vh] w-[960px] flex-col py-5">
    <div class="flex justify-between">
      <div class="mb-8 flex gap-x-2">
        <Component
          :is="icon"
          :class="{ 'cursor-pointer hover:rotate-45': globalState.isLoggin }"
          class="transition-[transform] duration-300"
          @click="handleCreate"
        />
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
import { useGlobalState } from '@/hooks/use-global.state'

defineProps({
  icon: { type: Function as PropType<FunctionalComponent<LucideProps, {}, any, {}>>, required: true },
  title: { type: String, required: true }
})

const emit = defineEmits(['create'])

const { themeActive, handleTheme } = usePhotosState()

const { globalState } = useGlobalState()

const handleCreate = () => {
  if (globalState.value.isLoggin) {
    emit('create')
  }
}
</script>

<style scoped lang="scss"></style>

<template>
  <Dialog v-model:open="show">
    <DialogContent class="!w-[60vw] !max-w-[60vw] gap-0 !rounded-none !border-none p-0" :hideCloseButton="true">
      <DialogTitle />
      <DialogDescription />

      <div class="relative aspect-[1.5] w-full">
        <img :src="photo" class="h-full w-full object-cover" />

        <div class="absolute bottom-[-30px] left-[50%] w-full translate-x-[-50%] text-center text-[16px] text-white">{{ title }}</div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script lang="tsx" setup>
import { ref } from 'vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const show = ref(false)
const photo = ref('')
const title = ref('')

defineExpose({
  onShow: (src: string, _title?: string) => {
    photo.value = src
    title.value = _title || ''
    show.value = true
  }
})
</script>

<template>
  <Dialog v-model:open="show">
    <DialogContent
      class="gap-0 !rounded-none !border-none bg-[#666] p-0"
      :class="[desc ? '!w-[70vw] !max-w-[70vw]' : '!w-[60vw] !max-w-[60vw]']"
      :hideCloseButton="true"
    >
      <DialogTitle />
      <DialogDescription />

      <div class="relative w-full">
        <div class="flex w-full gap-x-4">
          <SnowImage 
            :src="photo" 
            :container-class="`aspect-[1.5] ${desc ? 'w-[85%]' : 'w-full'}`"
            image-class="h-full object-cover"
          />

          <div v-if="desc" class="flex-1 p-2 text-white">
            <div class="text-[20px] font-medium">简述：</div>
            <div class="">{{ desc }}</div>
          </div>
        </div>

        <div class="absolute bottom-[-30px] left-[50%] w-full translate-x-[-50%] text-center text-[16px] text-white">{{ title }}</div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script lang="tsx" setup>
import { ref } from 'vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import SnowImage from '@/components/snow-image/SnowImage.vue'

const show = ref(false)
const photo = ref('')
const title = ref('')
const desc = ref('')

defineExpose({
  onShow: (src: string, _title?: string, _desc?: string) => {
    photo.value = src
    title.value = _title || ''
    desc.value = _desc || ''
    show.value = true
  }
})
</script>

<template>
  <Dialog v-model:open="show">
    <DialogContent
      class="h-auto max-h-[90vh] !w-[70vw] !max-w-[70vw] gap-0 overflow-hidden !rounded-none !border-none bg-[#666] p-0"
      :hideCloseButton="true"
    >
      <DialogTitle />
      <DialogDescription />

      <div class="relative w-full">
        <div class="flex w-full gap-x-4">
          <SnowImage
            :src="photo"
            :container-class="`aspect-[1.5] flex justify-center ${desc ? 'lg:w-[85%] w-full' : 'w-full'}`"
            image-class="h-full object-fit"
          />

          <div v-if="desc" class="hidden flex-1 p-2 text-white lg:block">
            <div class="text-[16px] font-medium">简述：</div>
            <div class="text-[14px]">{{ desc }}</div>
          </div>
        </div>

        <div
          class="absolute bottom-[10px] left-[50%] w-full translate-x-[-50%] text-center text-[20px] text-white"
          :class="{ 'lg:left-[42.5%] lg:w-[85%]': desc, '': !desc }"
        >
          {{ title }}
        </div>
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

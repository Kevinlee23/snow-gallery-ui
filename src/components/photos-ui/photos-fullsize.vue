<template>
  <Dialog v-model:open="show">
    <DialogContent
      class="h-auto max-h-[90vh] !w-[70vw] !max-w-[80vw] gap-0 overflow-hidden !rounded-none !border-none bg-[#666] p-0"
      :hideCloseButton="true"
    >
      <DialogTitle />
      <div class="relative h-full w-full">
        <Fullsize
          :src="photo"
          :background="themeActive === 'dark' ? '#1f2937' : '#f3f4f6'"
          :container-class="`flex h-full w-full justify-center`"
          @zoom="onZoom"
        />
        <div
          v-show="showZoom"
          class="pointer-events-none absolute bottom-4 left-4 rounded bg-black/60 px-2 py-1 text-white shadow-sm"
        >
          {{ zoomText }}
        </div>
        <div
          class="absolute bottom-[10px] left-[50%] w-full translate-x-[-50%] text-center text-[20px] text-white"
        >
          {{ title }}
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script lang="tsx" setup>
import { ref } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import Fullsize from '@/components/fullsize/index.vue'
import { usePhotosState } from '@/hooks/use-photos-state'

const { themeActive } = usePhotosState()

const show = ref(false)
const photo = ref('')
const title = ref('')
const desc = ref('')

// zoom indicator state
const showZoom = ref(false)
const zoomText = ref('')
let hideTimer: any

const updateZoomText = useThrottleFn((scale: number) => {
  zoomText.value = `${scale.toFixed(2)}x`
}, 120, true, true)

function onZoom(payload: { scale: number; x: number; y: number }) {
  showZoom.value = true
  updateZoomText(payload.scale)
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    showZoom.value = false
  }, 2000)
}

defineExpose({
  onShow: (src: string, _title?: string, _desc?: string) => {
    photo.value = src
    title.value = _title || ''
    desc.value = _desc || ''
    show.value = true
  }
})
</script>

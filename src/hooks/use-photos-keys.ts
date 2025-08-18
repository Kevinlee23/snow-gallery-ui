import { onMounted, onUnmounted, ref } from 'vue'
import { useMagicKeys } from '@vueuse/core'

export const dialogOrSheetVisible = ref(false)

export const usePhotosKeys = () => {
  const keys = useMagicKeys()
  const CmdK = keys['Meta+k']
  const listKey = keys['l']
  const gridKey = keys['g']
  const ctrlK = keys['ctrl+k']

  // 阻止 Ctrl+K 默认行为
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault()
    }
  }

  onMounted(() => {
    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    // 移除键盘事件监听器
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    CmdK,
    listKey,
    gridKey,
    ctrlK,
    handleKeyDown,
    dialogOrSheetVisible
  }
}

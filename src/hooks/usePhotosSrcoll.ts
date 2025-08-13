import { ref, watch, computed, onUnmounted } from 'vue'
import { useWindowScroll } from '@vueuse/core'

export const usePhotosSrcoll = () => {
  // 滚动相关逻辑
  const { y } = useWindowScroll()
  const prevScrollY = ref(0)
  const scrollDirection = ref<'up' | 'down'>('down')
  const isScrolledDown = ref(false)
  // 滚动配置
  const SCROLL_THRESHOLD = 10 // 最小滚动距离阈值
  const DEBOUNCE_DELAY = 16 // 防抖延迟（约1帧，更快响应）
  const SHOW_TOOLBAR_THRESHOLD = 100 // 显示工具栏的滚动阈值
  let scrollTimer: number | null = null
  // 监听滚动方向
  watch(
    () => y.value,
    (newY: number) => {
      const deltaY = newY - prevScrollY.value

      // 阈值判断
      if (Math.abs(deltaY) >= SCROLL_THRESHOLD) {
        // 清除之前的定时器
        if (scrollTimer) {
          clearTimeout(scrollTimer)
        }

        // 轻微的防抖，主要用于避免同一帧内的重复计算
        scrollTimer = window.setTimeout(() => {
          // 保持原有简单逻辑
          scrollDirection.value = newY > prevScrollY.value ? 'down' : 'up'
          prevScrollY.value = newY
        }, DEBOUNCE_DELAY)
      } else {
        // 如果变化很小，也更新记录值，但不改变方向
        prevScrollY.value = newY
      }

      // 判断是否滚动到页面下方
      isScrolledDown.value = newY > SHOW_TOOLBAR_THRESHOLD
    }
  )
  // 计算是否显示固定工具栏
  const isToolbarFixed = computed(() => {
    return isScrolledDown.value && scrollDirection.value === 'up'
  })

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  onUnmounted(() => {
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }
  })

  return {
    isToolbarFixed,
    handleScrollToTop
  }
}

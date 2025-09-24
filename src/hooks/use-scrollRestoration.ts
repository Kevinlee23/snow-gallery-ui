import { onBeforeUnmount, onMounted } from "vue"
import { useRoute } from "vue-router"

export function useScrollRestoration(key?: string, container: HTMLElement | Window = window) {
  const route = useRoute()
  const storageKey = key || `scroll-${route.fullPath}`

  function getScrollTop() {
    return container instanceof Window ? window.scrollY : container.scrollTop
  }

  function setScrollTop(top: number) {
    if (container instanceof Window) {
      window.scrollTo({ top, behavior: "auto" })
    } else {
      container.scrollTop = top
    }
  }

  async function restore() {
    const saved = sessionStorage.getItem(storageKey)
    if (!saved) return
    const target = Number(saved)

    // 轮询等待 DOM 高度足够
    let tries = 0
    const maxTries = 30 // 最多等 30 次（大约 1.5s）
    const timer = setInterval(() => {
      const scrollHeight =
        container instanceof Window
          ? document.documentElement.scrollHeight
          : container.scrollHeight

      if (scrollHeight > target || tries >= maxTries) {
        setScrollTop(target)
        clearInterval(timer)
      }
      tries++
    }, 50)
  }

  onMounted(() => {
    restore()
  })

  onBeforeUnmount(() => {
    sessionStorage.setItem(storageKey, String(getScrollTop()))
  })

  return { restore }
}
import type { LayoutType, SortType, ThemeType } from '@/types/photos'

import { ref } from 'vue'
import { toast } from 'vue-sonner'

// 主题配色作为全局状态使用
const themeActive = ref<ThemeType>('system')
export const usePhotosState = (layout: LayoutType = 'grid') => {
  // 布局和排序作为局部状态使用
  const layoutActive = ref<LayoutType>(layout)
  const sortActive = ref<SortType>('createdTimeDesc')

  const handleLayout = (layout: LayoutType) => {
    if (layoutActive.value !== layout) {
      toast(`切换布局: ${layout.toUpperCase()} `)
    }

    layoutActive.value = layout
  }
  const handleSort = (sort: SortType) => {
    if (sortActive.value !== sort) {
      toast(`切换排序方式: ${sort.toUpperCase()} `)
    }
    sortActive.value = sort
  }
  const handleTheme = (theme: ThemeType) => {
    if (themeActive.value !== theme) {
      toast(`切换主题: ${theme.toUpperCase()} `)
    }
    themeActive.value = theme
  }

  return {
    layoutActive,
    sortActive,
    themeActive,
    handleLayout,
    handleSort,
    handleTheme
  }
}

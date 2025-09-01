import type { FilterGroupItem, FilterType } from '@/types/photos'
import type { Response } from '@/types/response'

import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

const loading = ref(false)
const filterList = ref<FilterGroupItem[]>([])
export const useFilterLocal = (type: FilterType | 'ALL') => {
  const route = useRoute()

  const getFilterList = async () => {
    const res: Response<FilterGroupItem[]> = await request.get('/search/filter-list', {})
    filterList.value = res.data.filter((item) => item.list.length > 0)
  }

  const filterValue = route.params.id as string
  const filterLabel = computed(() => {
    const group = filterList.value.find((item) => item.type === type)

    if (group) {
      const item = group.list.find((item) => String(item.value) === filterValue)
      return item?.label || ''
    }

    return ''
  })

  const addNewIttem = (type: FilterType, label: string, value?: string, total: number = 1) => {
    const group = filterList.value.find((item) => item.type === type)
    if (group) {
      group.list.push({ label, value: value || 'NEW', total: total })
    } else {
      filterList.value.push({ type, list: [{ label, value: value || 'NEW', total: total }] })
    }
  }

  const updateItem = (type: FilterType, label: string, value: string, total: number) => {
    const group = filterList.value.find((item) => item.type === type)
    if (group) {
      const item = group.list.find((item) => item.value === value)

      if (item) {
        item.label = label
        item.total = total
      }
    }
  }

  const removeItem = (type: FilterType, _id: string) => {
    const group = filterList.value.find((item) => item.type === type)
    if (group) {
      group.list = group.list.filter((item) => item.value !== _id)
    }
  }

  onMounted(async () => {
    if (filterList.value.length === 0 && !loading.value) {
      loading.value = true
      await getFilterList()
      loading.value = false
    }
  })

  return {
    filterList,
    filterValue,
    filterLabel,
    getFilterList,
    addNewIttem,
    updateItem,
    removeItem
  }
}

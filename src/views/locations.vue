<template>
  <NoToolbarTemplate :icon="MapPin" title="Light and shadow in travel." contentClass="xl:!w-[1280px]" @create="handleLocationEdit">
    <div class="flex-1">
      <div class="relative mb-4 h-[500px]">
        <div id="map" class="h-full w-full" />

        <!-- 地图加载状态 -->
        <div v-if="isMapLoading" class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div class="flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-400">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
            <div class="text-sm">地图加载中...</div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card v-for="location in locations" :key="location._id" class="min-h-[150px]">
          <CardHeader class="flex flex-row items-center justify-between">
            <div class="text-[16px] font-medium">
              {{ location.fullName }}
            </div>
            <PenTool
              v-if="globalState.isLoggin"
              :size="16"
              class="cursor-pointer text-gray-500/80 hover:text-black dark:hover:text-white"
              @click="handleLocationEdit(location)"
            />
          </CardHeader>
          <CardContent>
            <div class="w-full text-right text-[14px] dark:text-gray-400">{{ location.photoCount }} PHOTOS</div>
          </CardContent>
          <CardFooter v-if="location.photoCount > 0" class="flex justify-end gap-x-2 px-2 pb-4">
            <Button class="dark:text-gray-400 dark:hover:bg-gray-500/30" variant="outline" @click="handleShare(location)">
              <Share />
              Share
            </Button>
            <router-link :to="`/location/${location._id}`">
              <Button class="dark:bg-gray-500/30 dark:text-gray-400">
                <Eye />
                View
              </Button>
            </router-link>
          </CardFooter>
        </Card>
      </div>
    </div>

    <PhotosShare ref="shareUIRef" />
    <LocationSheet ref="locationSheetRef" @submit="handleSubmit" @delete="handleDelete" />
  </NoToolbarTemplate>
</template>

<script setup lang="ts">
import type { Location, LocationCreate } from '@/types/location'
import type { Response } from '@/types/response'
import type { MapLocation } from '@/types/map'

import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { MapPin, Share, Eye, PenTool } from 'lucide-vue-next'
import { isDef } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { PhotosShare } from '@/components/photos-ui'
import LocationSheet from '@/components/sheet/location-sheet.vue'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import { useGlobalState } from '@/hooks/use-global-state'
import { usePhotosState } from '@/hooks/use-photos-state'
import { useMap } from '@/hooks/map'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { filterEmptyFields } from '@/utils/form'
import request from '@/utils/request'

const { globalState } = useGlobalState()

// 业务逻辑相关的 refs 和函数
const shareUIRef = ref<InstanceType<typeof PhotosShare>>()
const handleShare = async (location: Location) => {
  const res = await request.post('/gallery/location/related-photos', {
    _id: location._id,
    limit: 1
  })

  shareUIRef.value?.onShow('LOCATION', {
    _id: location._id,
    title: `${location.fullName} ${location.coordinate ? `(${location.coordinate[0]}, ${location.coordinate[1]})` : ''}`,
    total: res.data.total,
    cover: res.data.list[0].imageUrl
  })
}
const locationSheetRef = ref<InstanceType<typeof LocationSheet>>()
const handleLocationEdit = (location?: Location) => {
  locationSheetRef.value?.handleOpen(location)
}
const { addNewIttem, updateItem, removeItem } = useFilterLocal('LOCATION')
const handleSubmit = async (values: Location) => {
  const filterValues = filterEmptyFields(values) as LocationCreate
  const latitude = filterValues.coordinate?.[0]
  const longitude = filterValues.coordinate?.[1]

  if (!isDef(latitude) || !isDef(longitude)) {
    delete filterValues.coordinate
  }

  let res: Response<null | string>
  if (values._id) {
    res = await request.post('/gallery/location/update', filterValues)
    updateItem('LOCATION', filterValues.fullName, values._id, filterValues.photoCount || 0)
  } else {
    res = await request.post('/gallery/location/create', filterValues)
    addNewIttem('LOCATION', filterValues.fullName, res.data as string, 0)
  }
  toast.success(res.message)

  await loadLocations()
}
const handleDelete = async (id: string) => {
  const res: Response = await request.post('/gallery/location/delete', {
    _id: id
  })
  toast.success(res.message)
  await loadLocations()

  removeItem('LOCATION', id)
}

// 位置数据获取
const locations = ref<Location[]>([])
const loadLocations = async () => {
  const res: Response<Location[]> = await request.post('/gallery/location/list', {})
  locations.value = res.data

  // 将位置数据转换为地图位置格式
  const mapLocations: MapLocation[] = res.data.map((location) => ({
    _id: location._id,
    fullName: location.fullName,
    coordinate: location.coordinate as [number, number],
    photoCount: location.photoCount
  }))

  // 更新地图标记
  addLocationMarkers(mapLocations)
}

// 初始化地图
const { isDarkMode } = usePhotosState()
const mapConfig = {
  containerId: 'map',
  center: {
    lat: Number(import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT) || 33.54,
    lng: Number(import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG) || 110.43
  },
  zoom: Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 4,
  isDarkMode: isDarkMode.value
}
const mapControls = {
  showZoomControl: true,
  showLocateControl: true,
  showZoomLevelDisplay: true,
  zoomControlPosition: 'topright' as const
}

// 使用统一的地图 Hook
const { isMapReady, initMap, destroyMap, addLocationMarkers, toggleDarkMode } = useMap({
  config: mapConfig,
  controls: mapControls,
  autoFitBounds: false
})

// 地图加载状态
const isMapLoading = ref(true)

// 监听地图准备状态，准备好后加载位置数据
watch(isMapReady, (ready) => {
  if (ready) {
    isMapLoading.value = false
    // 地图准备好后异步加载位置数据
    loadLocations().catch((error) => {
      console.error('位置数据加载失败:', error)
      toast.error('位置数据加载失败')
    })
  }
})

// 监听暗色模式变化，动态切换地图样式
watch(isDarkMode, (newValue) => {
  if (isMapReady.value) {
    toggleDarkMode(newValue)
  }
})

// 组件生命周期
onMounted(() => {
  // 异步初始化地图，不阻塞页面进入
  try {
    initMap()
  } catch (error) {
    console.error('地图初始化失败:', error)
    toast.error('地图加载失败，请刷新页面重试')
    isMapLoading.value = false // 即使失败也隐藏加载状态
  }
})

onBeforeUnmount(() => {
  // 清理地图资源
  destroyMap()
})
</script>

<style lang="scss" scoped>
#map {
  position: relative;
  z-index: 1;
}

// Leaflet 地图样式兼容
:deep(.leaflet-container) {
  z-index: 1;
}

:deep(.leaflet-control-container) {
  z-index: 10;
}

// Mapbox 地图样式兼容
:deep(.mapboxgl-map) {
  z-index: 1;
}

:deep(.mapboxgl-control-container) {
  z-index: 10;
}

// 自定义标记样式（用于 Mapbox）
:deep(.mapbox-marker) {
  display: block;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

:deep(.mapboxgl-popup-content) {
  color: #000 !important;
}

// 暗色模式下的 Leaflet 控件样式
:deep(.dark-mode .leaflet-control-zoom a) {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
}

:deep(.dark-mode .leaflet-control-locate a) {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
}

// 缩放级别显示样式
:deep(.zoom-level-display) {
  pointer-events: none;
  user-select: none;
}
</style>

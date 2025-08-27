<template>
  <NoToolbarTemplate :icon="MapPin" title="Light and shadow in travel." contentClass="!w-[1280px]" @create="handleLocationEdit">
    <div class="flex-1">
      <div id="map" class="mb-4 h-[500px]" />
      <div class="grid grid-cols-4 gap-4">
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

    <ShareUI ref="shareUIRef" />
    <LocationSheet ref="locationSheetRef" @submit="handleSubmit" @delete="handleDelete" />
  </NoToolbarTemplate>
</template>

<script setup lang="ts">
import type { Location } from '@/types/location'
import type { Response } from '@/types/response'

import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { MapPin, Share, Eye, PenTool } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ShareUI from '@/components/photos-ui/share-ui.vue'
import LocationSheet from '@/components/sheet/location-sheet.vue'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import { useGlobalState } from '@/hooks/use-global-state'
import { usePhotosState } from '@/hooks/use-photos-state'
import { filterEmptyFields } from '@/utils/form'
import request from '@/utils/request'
import { useMap, type MapLocation } from '@/hooks/use-map'

const { globalState } = useGlobalState()
const { isDarkMode } = usePhotosState()

// 业务逻辑相关的 refs 和函数
const shareUIRef = ref<InstanceType<typeof ShareUI>>()
const handleShare = async (location: Location) => {
  const res = await request.post('/gallery/location/related-photos', {
    _id: location._id,
    limit: 1
  })

  shareUIRef.value?.onShow('LOCATION', {
    _id: location._id,
    title: location.fullName,
    total: res.data.total,
    cover: res.data.list[0].imageUrl
  })
}

const locationSheetRef = ref<InstanceType<typeof LocationSheet>>()
const handleLocationEdit = (location?: Location) => {
  locationSheetRef.value?.handleOpen(location)
}
const handleSubmit = async (values: Location) => {
  const filterValues = filterEmptyFields(values)

  let res: Response<null>
  if (values._id) {
    res = await request.post('/gallery/location/update', filterValues)
  } else {
    res = await request.post('/gallery/location/create', filterValues)
  }
  toast.success(res.message)

  await loadLocations()
}
const handleDelete = async (id: string) => {
  const res: Response<null> = await request.post('/gallery/location/delete', {
    _id: id
  })

  toast.success(res.message)
  await loadLocations()
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

const mapHandlers = {
  onZoomEnd: (zoom: number) => {}
}

// 使用统一的地图 Hook
const {
  // mapInstance,     // 原始地图实例（高级操作时使用）
  isMapReady,
  // currentLocation, // 当前用户位置（UI 显示时使用）
  // isLocating,      // 定位状态（加载动画时使用）
  // markers,         // 标记列表（管理时使用）
  initMap,
  destroyMap,
  addLocationMarkers,
  // clearAllMarkers, // 清除操作时使用
  // flyToLocation,   // 导航功能时使用
  // startLocationTracking, // 开始跟踪时使用
  // stopLocationTracking,  // 停止跟踪时使用
  toggleDarkMode
} = useMap({
  config: mapConfig,
  controls: mapControls,
  handlers: mapHandlers,
  autoFitBounds: true
})

// 监听暗色模式变化，动态切换地图样式
watch(isDarkMode, (newValue) => {
  if (isMapReady.value) {
    toggleDarkMode(newValue)
  }
})

// 组件生命周期
onMounted(async () => {
  try {
    // 初始化地图
    await initMap()

    // 加载位置数据
    await loadLocations()
  } catch (error) {
    console.error('地图初始化失败:', error)
    toast.error('地图加载失败，请刷新页面重试')
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

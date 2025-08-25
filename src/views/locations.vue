<template>
  <NoToolbarTemplate :icon="MapPin" title="Light and shadow in travel." class="!w-[1280px]" @create="handleLocationEdit">
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
              class="cursor-pointer text-gray-500/80 hover:text-black"
              @click="handleLocationEdit(location)"
            />
          </CardHeader>
          <CardContent>
            <div class="w-full text-right text-[14px]">{{ location.photoCount }} PHOTOS</div>
          </CardContent>
          <CardFooter v-if="location.photoCount > 0" class="flex justify-end gap-x-2 px-2 pb-4">
            <Button variant="outline" @click="handleShare(location)">
              <Share />
              Share
            </Button>
            <router-link :to="`/location/${location._id}`">
              <Button>
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
import { LocateControl } from 'leaflet.locatecontrol'

import { onMounted, onBeforeUnmount, ref } from 'vue'
import { MapPin, Share, Eye, PenTool } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import L from 'leaflet'
import 'leaflet.locatecontrol'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ShareUI from '@/components/photos-ui/share-ui.vue'
import LocationSheet from '@/components/sheet/location-sheet.vue'
import { useGlobalState } from '@/hooks/use-global-state'
import { filterEmptyFields } from '@/utils/form'
import request from '@/utils/request'
import flagIcon from '@/assets/flag_flat.png'

const { globalState } = useGlobalState()

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

  await init()
}
const handleDelete = async (id: string) => {
  const res: Response<null> = await request.post('/gallery/location/delete', {
    _id: id
  })

  toast.success(res.message)
  await init()
}

const map = ref<L.Map>()
const locateControl = ref<LocateControl>()
const marks = ref<L.Marker[]>([])
const currentLocation = ref<{ lat: number; lng: number } | null>(null)
const isLocating = ref(false)
const lastLocationUpdate = ref<number>(0)
const locationUpdateCount = ref(0)
// 位置获取成功回调函数
const onLocationFound = (event: L.LocationEvent) => {
  const { lat, lng } = event.latlng
  locationUpdateCount.value++

  // 防抖机制：限制回调执行频率（500ms内只执行一次）
  const now = Date.now()
  const shouldExecuteCallback = now - lastLocationUpdate.value > 500

  // 位置变化阈值：只有当位置变化超过50米时才执行回调
  const hasSignificantChange =
    !currentLocation.value ||
    Math.abs(currentLocation.value.lat - lat) > 0.0005 || // 约50米
    Math.abs(currentLocation.value.lng - lng) > 0.0005

  // 更新当前位置
  currentLocation.value = { lat, lng }
  isLocating.value = false

  // 只在第一次或位置有显著变化时显示提示
  if (locationUpdateCount.value === 1 || hasSignificantChange) {
    toast.success(`成功获取位置: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
  }

  // 执行自定义业务逻辑（添加防抖和阈值判断）
  if (shouldExecuteCallback && hasSignificantChange) {
    lastLocationUpdate.value = now
    handleLocationUpdate(lat, lng)
  }
}
// 位置获取失败回调函数
const onLocationError = (event: L.ErrorEvent) => {
  console.error('位置获取失败：', event.message)
  isLocating.value = false

  // 根据错误类型提供更友好的错误信息
  let errorMessage = '位置获取失败'
  switch (event.code) {
    case 1:
      errorMessage = '用户拒绝了位置访问请求'
      break
    case 2:
      errorMessage = '位置信息不可用'
      break
    case 3:
      errorMessage = '位置获取超时'
      break
    default:
      errorMessage = event.message || '未知错误'
  }

  toast.error(`位置获取失败: ${errorMessage}`)
  currentLocation.value = null
}
// 处理位置更新的业务逻辑
const handleLocationUpdate = (lat: number, lng: number) => {
  const loc: L.LatLng = L.latLng(lat, lng)
  marks.value.map((mark) => {
    const markLoc = mark.getLatLng()
    const distance = markLoc.distanceTo(loc)
    const prev = mark.getPopup()?.getContent()
    mark.bindPopup(`${prev}<br>距离当前位置: ${(distance / 1000).toFixed(0)}km`)

    return mark
  })
}
// 重置位置更新状态
const resetLocationState = () => {
  locationUpdateCount.value = 0
  lastLocationUpdate.value = 0
  console.log('位置更新状态已重置')
}

// location 数据获取
const locations = ref<Location[]>([])
const init = async () => {
  const res: Response<Location[]> = await request.post('/gallery/location/list', {})
  locations.value = res.data
}

// 监听缩放事件，实时更新缩放级别显示
const onZoomEnd = () => {
  const zoomDisplay = document.querySelector('.zoom-level-display')
  if (zoomDisplay) {
    zoomDisplay.innerHTML = `缩放级别: ${map.value?.getZoom()}`
  }
}
onMounted(async () => {
  // 初始化地图
  map.value = L.map('map').setView([33.54, 110.43], 4)
  map.value.zoomControl.setPosition('topright')

  // 添加位置事件监听器
  map.value.on('locationfound', onLocationFound)
  map.value.on('locationerror', onLocationError)

  // 添加定位控件
  locateControl.value = new LocateControl({
    position: 'topright',
    flyTo: true,
    initialZoomLevel: 5,
    drawCircle: true,
    drawMarker: true,
    showPopup: false,
    strings: {
      title: '获取我的位置'
    },
    locateOptions: {
      enableHighAccuracy: true,
      watch: false, // 关闭持续监听，只获取一次位置
      maximumAge: 30000,
      timeout: 15000
    }
  }).addTo(map.value)

  // 添加 OpenStreetMap 瓦片图层
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value)

  // 添加缩放级别显示
  const zoomLevelControl = new L.Control({ position: 'bottomleft' })
  zoomLevelControl.onAdd = function (map: L.Map) {
    const div = L.DomUtil.create('div', 'zoom-level-display')
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
    div.style.padding = '5px 10px'
    div.style.borderRadius = '3px'
    div.style.fontSize = '14px'
    div.style.fontWeight = 'bold'
    div.innerHTML = `缩放级别: ${map.getZoom()}`
    return div
  }
  zoomLevelControl.addTo(map.value)

  map.value.on('zoomend', onZoomEnd)

  await init()

  // 添加标记点
  const myIcon = L.icon({
    iconUrl: flagIcon,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })

  if (map.value) {
    locations.value.forEach((location) => {
      if (location.coordinate && location.coordinate.length === 2) {
        const mark = L.marker([location.coordinate[0], location.coordinate[1]], { title: location.fullName, icon: myIcon })
          .addTo(map.value as L.Map)
          .bindPopup(`${location.fullName}<br>${location.photoCount} PHOTOS`)
        marks.value.push(mark)
      }
    })
  }
})

onBeforeUnmount(() => {
  // 清理位置监听器
  if (map.value) {
    map.value.off('locationfound', onLocationFound)
    map.value.off('locationerror', onLocationError)
    map.value.off('zoomend', onZoomEnd)
  }
  // 重置位置状态
  resetLocationState()
})
</script>

<style lang="scss" scoped>
#map {
  position: relative;
  z-index: 1;
}

// 确保 Leaflet 地图内部元素不会覆盖 dialog
:deep(.leaflet-container) {
  z-index: 1;
}

:deep(.leaflet-control-container) {
  z-index: 10;
}
</style>

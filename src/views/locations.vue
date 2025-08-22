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

import { onMounted, ref } from 'vue'
import { MapPin, Share, Eye, PenTool } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import L from 'leaflet'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ShareUI from '@/components/photos-ui/share-ui.vue'
import LocationSheet from '@/components/sheet/location-sheet.vue'
import { useGlobalState } from '@/hooks/use-global-state'
import { filterEmptyFields } from '@/utils/form'
import request from '@/utils/request'

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

const init = async () => {
  const res: Response<Location[]> = await request.post('/gallery/location/list', {})
  locations.value = res.data
}
const locations = ref<Location[]>([])
const map = ref<L.Map>()
onMounted(async () => {
  // 初始化地图
  map.value = L.map('map').setView([33.54, 110.43], 4)
  map.value.zoomControl.setPosition('topright')

  // 添加 OpenStreetMap 瓦片图层
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value)

  await init()

  // 添加标记点
  if (map.value) {
    locations.value.forEach((location) => {
      if (location.coordinate && location.coordinate.length === 2) {
        L.marker([location.coordinate[0], location.coordinate[1]])
          .addTo(map.value as L.Map)
          .bindPopup(`${location.fullName}<br>${location.photoCount} PHOTOS`)
      }
    })
  }
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

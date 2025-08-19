<template>
  <NoToolbarTemplate :icon="MapPin" title="Light and shadow in travel." class="!w-[1280px]" @create="handleCreate">
    <div class="flex-1">
      <div class="grid grid-cols-4 gap-4">
        <Card v-for="location in locations" :key="location._id" class="min-h-[150px]">
          <CardHeader class="flex flex-row items-center justify-between">
            <div class="text-[16px] font-medium">
              {{ location.fullName }}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger @click="handleEdit(location)">
                  <PenTool v-if="globalState.isLoggin" :size="16" class="cursor-pointer text-gray-500/80 hover:text-black" />
                </TooltipTrigger>
                <TooltipContent side="bottom">编辑</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
    <LocationSheet ref="locationSheetRef" @submit="handleSubmit" />
  </NoToolbarTemplate>
</template>

<script setup lang="ts">
import type { Location } from '@/types/location'
import type { Response } from '@/types/response'

import { onMounted, ref } from 'vue'
import { MapPin, Share, Eye, PenTool } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ShareUI from '@/components/photos-ui/share-ui.vue'
import LocationSheet from '@/components/sheet/location-sheet.vue'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import { useGlobalState } from '@/hooks/use-global-state'
import request from '@/utils/request'
import { filterEmptyFields } from '@/utils/form'

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
const handleCreate = () => {
  locationSheetRef.value?.handleOpen()
}
const handleEdit = (location: Location) => {
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

const init = async () => {
  const res: Response<Location[]> = await request.post('/gallery/location/list', {})
  locations.value = res.data
}
const locations = ref<Location[]>([])
onMounted(init)
</script>

<style lang="scss" scoped></style>

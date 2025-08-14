<template>
  <NoToolbarTemplate :icon="MapPin" title="Light and shadow in travel." class="!w-[1280px]">
    <div class="flex-1">
      <div class="grid grid-cols-4 gap-4">
        <Card v-for="location in locations" :key="location._id" class="min-h-[150px]">
          <CardHeader class="text-[16px] font-medium">
            {{ location.fullName }}
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
  </NoToolbarTemplate>
</template>

<script setup lang="ts">
import type { Location } from '@/types/location'
import type { Response } from '@/types/response'

import { onMounted, ref } from 'vue'
import { MapPin, Share, Eye } from 'lucide-vue-next'
import ShareUI from '@/components/photos-ui/share-ui.vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import request from '@/utils/request'

const locations = ref<Location[]>([])
onMounted(async () => {
  const res: Response<Location[]> = await request.post('/gallery/location/list', {})
  locations.value = res.data
})

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
</script>

<style lang="scss" scoped></style>

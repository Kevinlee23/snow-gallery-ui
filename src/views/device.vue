<template>
  <NoToolbarTemplate :icon="CameraIcon" title="Device for travel.">
    <Card class="w-full flex-1">
      <CardContent class="flex flex-col gap-y-4 px-4 pb-6 pt-4">
        <div class="box">
          <div class="box-title">品牌</div>
          <Carousel class="main-carousel" @init-api="(val) => (brandMainApi = val)">
            <CarouselContent>
              <CarouselItem v-for="brand in brandList" :key="brand._id">
                <Card class="main-card">
                  <CardContent class="main-card-content">
                    <img :src="brand.logo" alt="brand-logo" class="h-[80px] w-[80px]" />
                    <div class="text-[12px] font-bold">{{ brand.name }}</div>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <Carousel class="thumbnail-carousel" @init-api="(val) => (brandThumbnailApi = val)">
            <CarouselContent class="ml-0 flex gap-2">
              <CarouselItem
                v-for="(brand, index) in brandList"
                :key="brand._id"
                class="basis-1/4 cursor-pointer pl-0"
                @click="onBrandThumbClick(index)"
              >
                <Card>
                  <CardContent class="thumbnail-card-content">
                    <img
                      :src="brand.logo"
                      alt="brand-logo"
                      class="aspect-square w-full"
                      :class="[brandSelectedIndex === index ? 'opacity-100' : 'opacity-40']"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>

        <div class="box">
          <div class="box-title">相机</div>
          <Carousel class="main-carousel" @init-api="(val) => (cameraMainApi = val)">
            <CarouselContent>
              <CarouselItem v-for="camera in cameraList" :key="camera._id">
                <Card class="main-card">
                  <CardContent class="main-card-content relative">
                    <img :src="camera.imageUrl" alt="camera-image" class="h-[80px] w-[80px]" />
                    <div class="text-[12px] font-bold">{{ camera.brandRef.name }} · {{ camera.fullName }}</div>

                    <router-link :to="`/camera/${camera._id}`" class="pointer-events-auto absolute right-2 top-2 cursor-pointer text-gray-500/80">
                      <SquareArrowOutUpRight :size="20" />
                    </router-link>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <Carousel class="thumbnail-carousel" @init-api="(val) => (cameraThumbnailApi = val)">
            <CarouselContent class="ml-0 flex gap-2">
              <CarouselItem
                v-for="(camera, index) in cameraList"
                :key="camera._id"
                class="basis-1/4 cursor-pointer pl-0"
                @click="onCameraThumbClick(index)"
              >
                <Card>
                  <CardContent class="thumbnail-card-content">
                    <img
                      :src="camera.imageUrl"
                      alt="camera-image"
                      class="aspect-square w-full"
                      :class="[cameraSelectedIndex === index ? 'opacity-100' : 'opacity-40']"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </CardContent>
    </Card>
  </NoToolbarTemplate>
</template>

<script setup lang="ts">
import type { Brand, Camera } from '@/types/device'
import type { Response } from '@/types/response'
import type { CarouselApi } from '@/components/ui/carousel'

import { onMounted, ref } from 'vue'
import { watchOnce } from '@vueuse/core'
import { Camera as CameraIcon, SquareArrowOutUpRight } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import request from '@/utils/request'

const brandMainApi = ref<CarouselApi | null>(null)
const brandThumbnailApi = ref<CarouselApi | null>(null)
const brandSelectedIndex = ref(0)
const onBrandMainSelect = () => {
  if (!brandMainApi.value || !brandThumbnailApi.value) return
  brandSelectedIndex.value = brandMainApi.value.selectedScrollSnap()
  brandThumbnailApi.value.scrollTo(brandMainApi.value.selectedScrollSnap())
}
const onBrandThumbClick = (index: number) => {
  if (!brandMainApi.value || !brandThumbnailApi.value) return
  brandMainApi.value.scrollTo(index)
}
watchOnce(brandMainApi, (brandMainApi) => {
  if (!brandMainApi) return

  onBrandMainSelect()
  brandMainApi.on('select', onBrandMainSelect)
  brandMainApi.on('reInit', onBrandMainSelect)
})

const cameraMainApi = ref<CarouselApi | null>(null)
const cameraThumbnailApi = ref<CarouselApi | null>(null)
const cameraSelectedIndex = ref(0)
const onCameraMainSelect = () => {
  if (!cameraMainApi.value || !cameraThumbnailApi.value) return
  cameraSelectedIndex.value = cameraMainApi.value.selectedScrollSnap()
  cameraThumbnailApi.value.scrollTo(cameraMainApi.value.selectedScrollSnap())
}
const onCameraThumbClick = (index: number) => {
  if (!cameraMainApi.value || !cameraThumbnailApi.value) return
  cameraMainApi.value.scrollTo(index)
}

watchOnce(cameraMainApi, (cameraMainApi) => {
  if (!cameraMainApi) return
  onCameraMainSelect()
  cameraMainApi.on('select', onCameraMainSelect)
  cameraMainApi.on('reInit', onCameraMainSelect)
})

const brandList = ref<Brand[]>([])
const cameraList = ref<Camera[]>([])
onMounted(async () => {
  const brandRes: Response<Brand[]> = await request.post('/device/brand/list', {})
  brandList.value = brandRes.data

  const cameraRes: Response<Camera[]> = await request.post('/device/camera/list', {})
  cameraList.value = cameraRes.data
})
</script>

<style lang="scss" scoped>
.box {
  @apply flex flex-col gap-y-2;

  .box-title {
    @apply text-[16px] font-bold;
  }

  .main-carousel {
    @apply relative w-full max-w-[200px];
  }

  .thumbnail-carousel {
    @apply relative w-full max-w-[320px];
  }
}

.main-card {
  @apply aspect-square w-[200px];

  .main-card-content {
    @apply pointer-events-none flex h-full w-full flex-col items-center justify-center gap-y-2 p-4;
  }
}

.thumbnail-card-content {
  @apply flex aspect-square w-full items-center justify-center p-4;
}
</style>

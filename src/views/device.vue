<template>
  <NoToolbarTemplate :icon="CameraIcon" content-class="w-full md:w-fit" title="Device for travel.">
    <Card>
      <CardContent class="flex flex-col gap-y-4 p-4">
        <div class="box">
          <div class="box-title">
            <Copyright :size="16" :class="{ 'cursor-pointer hover:rotate-45': globalState.isLoggin }" class="transition-[transform] duration-300" />
            品牌
          </div>
          <Carousel class="main-carousel" @init-api="(val) => (brandMainApi = val)">
            <CarouselContent>
              <CarouselItem v-for="brand in brandList" :key="brand._id">
                <Card class="main-card">
                  <CardContent class="main-card-content">
                    <img :src="brand.logo" alt="brand-logo" class="h-[80px] w-[80px]" />
                    <div class="text-[12px] font-bold dark:text-gray-400">{{ brand.name }}</div>
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
          <div class="box-title">
            <CameraIcon
              :size="16"
              :class="{ 'cursor-pointer hover:rotate-45': globalState.isLoggin }"
              class="transition-[transform] duration-300"
              @click="handleCameraEdit(undefined)"
            />
            相机
          </div>
          <Carousel class="main-carousel" @init-api="(val) => (cameraMainApi = val)">
            <CarouselContent>
              <CarouselItem v-for="camera in cameraList" :key="camera._id">
                <Card class="main-card">
                  <CardContent class="main-card-content relative">
                    <img :src="camera.imageUrl" alt="camera-image" class="h-[80px] w-[80px]" />
                    <div class="text-[12px] font-bold dark:text-gray-400">{{ camera.brandRef.name }} · {{ camera.fullName }}</div>

                    <div class="absolute right-2 top-2 flex items-center gap-x-2">
                      <HoverCard>
                        <HoverCardTrigger>
                          <Maximize :size="16" class="pointer-events-auto cursor-pointer text-gray-500/80 hover:text-black dark:hover:text-white" />
                        </HoverCardTrigger>
                        <HoverCardContent side="top">
                          <div class="flex flex-col gap-y-2">
                            <div v-if="notNullish<string>(camera.isSLR)" class="hover-card-item">
                              {{ camera.isSLR === '1' ? '单反相机' : '微单相机' }}
                            </div>
                            <div v-if="notNullish<string>(camera.frameSize)" class="hover-card-item">
                              {{ camera.frameSize }}
                            </div>
                            <div class="hover-card-item">上市日期: {{ camera.releaseDateAt }}</div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <PenTool
                        v-if="globalState.isLoggin"
                        :size="16"
                        class="pointer-events-auto cursor-pointer text-gray-500/80 hover:text-black dark:hover:text-white"
                        @click="handleCameraEdit(camera)"
                      />
                      <router-link
                        :to="`/camera/${camera._id}`"
                        class="pointer-events-auto cursor-pointer text-gray-500/80 hover:text-black dark:hover:text-white"
                      >
                        <SquareArrowOutUpRight :size="16" />
                      </router-link>
                    </div>
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

        <div class="box">
          <div class="box-title">
            <Aperture :size="16" :class="{ 'cursor-pointer hover:rotate-45': globalState.isLoggin }" class="transition-[transform] duration-300" />
            镜头
          </div>
          <div class="flex w-full flex-col gap-y-2 md:w-[500px]">
            <div v-for="lens in lensList" :key="lens._id" class="flex justify-between rounded-[8px] border-[1px] border-gray-500/80 p-2">
              <div class="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] dark:text-gray-400">{{ lens.fullName }}</div>
              <div class="flex items-center gap-x-2">
                <HoverCard>
                  <HoverCardTrigger>
                    <Maximize :size="16" class="cursor-pointer text-gray-500/80 hover:text-black dark:hover:text-white" />
                  </HoverCardTrigger>
                  <HoverCardContent side="top">
                    <div class="flex flex-col gap-y-2">
                      <div class="hover-card-item">
                        <Copyright :size="16" />
                        {{ lens.isOriginal === '1' ? '原厂' : '副厂' }}:{{ (lens.brandRef as Brand).name }}
                      </div>
                      <div class="hover-card-item">
                        <Aperture :size="16" />
                        {{ lens.isFocusLenses === '1' ? `定焦镜头:${lens.focalLengths.split('-')[0]}` : `变焦镜头:${lens.focalLengths}` }}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <PenTool v-if="globalState.isLoggin" :size="16" class="cursor-pointer text-gray-500/80 hover:text-black dark:hover:text-white" />
                <router-link :to="`/lenses/${lens._id}`" class="text-gray-500/80 hover:text-black dark:hover:text-white">
                  <SquareArrowOutUpRight :size="16" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <CameraSheet ref="cameraSheetRef" :brands="brandList" @submit="handleCameraSubmit" @delete="handleCameraDelete" />
  </NoToolbarTemplate>
</template>

<script setup lang="ts">
import type { Brand, Camera, CameraCreate, Lenses } from '@/types/device'
import type { Response } from '@/types/response'
import type { CarouselApi } from '@/components/ui/carousel'

import { onMounted, ref } from 'vue'
import { notNullish, watchOnce } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Camera as CameraIcon, SquareArrowOutUpRight, Aperture, Maximize, PenTool, Copyright } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import CameraSheet from '@/components/sheet/camera-sheet.vue'
import NoToolbarTemplate from '@/views/layout/no-toolbar-template.vue'
import { useGlobalState } from '@/hooks/use-global-state'
import { filterEmptyFields } from '@/utils/form'
import request from '@/utils/request'

const { globalState } = useGlobalState()

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

const cameraSheetRef = ref<InstanceType<typeof CameraSheet>>()
const handleCameraEdit = (camera?: Camera) => {
  cameraSheetRef.value?.handleOpen(camera)
}
const handleCameraSubmit = async (values: CameraCreate) => {
  const filteredValues = filterEmptyFields(values)

  const res: Response<undefined> = await request.post(`/device/camera/${filteredValues._id ? 'update' : 'create'}`, filteredValues)
  toast.success(res.message)

  await cameraInit()
}
const handleCameraDelete = async (id: string) => {
  const res: Response<undefined> = await request.post(`/device/camera`, { _id: id })
  toast.success(res.message)

  await cameraInit()
}

const brandList = ref<Brand[]>([])
const cameraList = ref<Camera[]>([])
const lensList = ref<Lenses[]>([])

const cameraInit = async () => {
  const cameraRes: Response<Camera[]> = await request.post('/device/camera/list', {})
  cameraList.value = cameraRes.data
}
onMounted(async () => {
  const brandRes: Response<Brand[]> = await request.post('/device/brand/list', {})
  brandList.value = brandRes.data

  const lensRes: Response<Lenses[]> = await request.post('/device/lenses/list', {})
  lensList.value = lensRes.data

  await cameraInit()
})
</script>

<style lang="scss" scoped>
.box {
  @apply flex flex-col gap-y-2;

  .box-title {
    @apply flex items-center gap-x-1 text-[16px] font-bold;
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

.hover-card-item {
  @apply flex items-center gap-x-1 text-[14px];
}
</style>

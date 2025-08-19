<template>
  <Sheet v-model:open="show">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>相片上传</SheetTitle>
        <SheetDescription> 相片上传/修改 </SheetDescription>
      </SheetHeader>

      <form id="photo-upload-form" class="flex flex-col gap-4 py-4" @submit="onSubmit">
        <FormField v-slot="{ field }" name="imageUrl" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <div class="flex items-center overflow-hidden rounded-md border border-input bg-white">
                <Input
                  id="imageUrl"
                  v-bind="field"
                  autocomplete="off"
                  placeholder="相片链接"
                  class="!border-0 !shadow-none !outline-0 !ring-0 !ring-offset-0 focus:!border-0 focus:!shadow-none focus:!outline-none focus:!ring-0 focus:!ring-offset-0"
                  @focus="$event.target.parentElement?.classList.add('border-black')"
                  @blur="$event.target.parentElement?.classList.remove('border-black')"
                />
                <div class="h-6 w-px bg-border"></div>
                <div class="p-2">
                  <Dna v-if="!parseLoading" :size="16" class="cursor-pointer" @click="handleParseMetadata" />
                  <LoaderCircle v-else :size="16" class="animate-spin cursor-pointer" />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="aperture">
          <FormItem>
            <FormControl>
              <Input id="aperture" v-bind="field" autocomplete="off" placeholder="光圈" />
            </FormControl>
          </FormItem>
        </FormField>
        <div v-if="metadata.aperture" class="text-right text-[14px] text-gray-500/80">
          metadata: {{ metadata.aperture }}
          <span class="ml-2 cursor-pointer text-[12px] text-black hover:text-gray-500/80" @click="handleFill('aperture')">Fill</span>
        </div>
        <FormField v-slot="{ field }" name="shutter">
          <FormItem>
            <FormControl>
              <Input id="shutter" v-bind="field" autocomplete="off" placeholder="快门" />
            </FormControl>
          </FormItem>
        </FormField>
        <div v-if="metadata.shutter" class="text-right text-[14px] text-gray-500/80">
          metadata: {{ metadata.shutter }}
          <span class="ml-2 cursor-pointer text-[12px] text-black hover:text-gray-500/80" @click="handleFill('shutter')">Fill</span>
        </div>
        <FormField v-slot="{ field }" name="focalLength">
          <FormItem>
            <FormControl>
              <Input id="focalLength" v-bind="field" autocomplete="off" placeholder="焦距" />
            </FormControl>
          </FormItem>
        </FormField>
        <div v-if="metadata.focalLength" class="text-right text-[14px] text-gray-500/80">
          metadata: {{ metadata.focalLength }}
          <span class="ml-2 cursor-pointer text-[12px] text-black hover:text-gray-500/80" @click="handleFill('focalLength')">Fill</span>
        </div>
        <FormField v-slot="{ field }" name="ISO">
          <FormItem>
            <FormControl>
              <Input id="ISO" v-bind="field" autocomplete="off" placeholder="ISO" />
            </FormControl>
          </FormItem>
        </FormField>
        <div v-if="metadata.ISO" class="text-right text-[14px] text-gray-500/80">
          metadata: {{ metadata.ISO }}
          <span class="ml-2 cursor-pointer text-[12px] text-black hover:text-gray-500/80" @click="handleFill('ISO')">Fill</span>
        </div>
        <FormField v-slot="{ field }" name="title" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Input id="title" v-bind="field" autocomplete="off" placeholder="标题" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="description">
          <FormItem>
            <FormControl>
              <Input id="description" v-bind="field" autocomplete="off" placeholder="描述" />
            </FormControl>
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="shootingTimeAt">
          <FormItem>
            <FormControl>
              <div
                class="flex items-center overflow-hidden rounded-md border border-input bg-white transition-[border] duration-300"
                :class="{ 'border-black': calendarShow }"
              >
                <Input
                  id="shootingTimeAt"
                  :model-value="field.value"
                  @update:model-value="field.onChange"
                  disabled
                  placeholder="拍摄时间"
                  class="!cursor-text border-none disabled:!text-black disabled:!opacity-100"
                />
                <div class="h-6 w-px bg-border"></div>
                <Popover v-model:open="calendarShow">
                  <PopoverTrigger as-child>
                    <div class="cursor-pointer p-2">
                      <CalendarIcon :size="16" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar v-model="calendarValue as any" initial-focus @update:model-value="calendarShow = false" />
                  </PopoverContent>
                </Popover>
              </div>
            </FormControl>
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="location">
          <FormItem>
            <FormControl>
              <Select :model-value="field.value" @update:model-value="field.onChange" autocomplete="off" placeholder="拍摄地点">
                <SelectTrigger>
                  <SelectValue placeholder="选择拍摄地点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="item in locationList" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
                  <div v-if="locationList.length === 0" class="text-center text-sm text-gray-500/80">暂无地点</div>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="camera">
          <FormItem>
            <FormControl>
              <Select :model-value="field.value" @update:model-value="field.onChange" placeholder="相机">
                <SelectTrigger>
                  <SelectValue placeholder="选择相机" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="item in cameraList" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
                  <div v-if="cameraList.length === 0" class="text-center text-sm text-gray-500/80">暂无相机</div>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="lenses">
          <FormItem>
            <FormControl>
              <Select :model-value="field.value" @update:model-value="field.onChange" autocomplete="off" placeholder="镜头">
                <SelectTrigger>
                  <SelectValue placeholder="选择镜头" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="item in lensesList" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
                  <div v-if="lensesList.length === 0" class="text-center text-sm text-gray-500/80">暂无镜头</div>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        </FormField>
      </form>

      <SheetFooter>
        <Button type="submit" form="photo-upload-form"> 上传 </Button>
        <Button variant="outline" @click="handleCancel"> 取消 </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import type { Photo } from '@/types/photos'
import type { PhotoMetadata } from '@/types/parse'
import type { DateValue } from '@internationalized/date'

import { ref, computed, watchEffect } from 'vue'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { LoaderCircle, Dna, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { FormField, FormControl, FormItem, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import request from '@/utils/request'
import { useFilterLocal } from '@/hooks/use-filter-local'

const emit = defineEmits(['submit', 'openChange'])

const formSchema = toTypedSchema(
  z.object({
    _id: z.string().optional(),
    imageUrl: z.string().nonempty('相片链接不能为空'),
    aperture: z.string(),
    shutter: z.string(),
    focalLength: z.string(),
    ISO: z.string(),
    title: z.string().nonempty('标题不能为空'),
    description: z.string(),
    shootingTimeAt: z.string(),
    location: z.string(),
    camera: z.string(),
    lenses: z.string()
  })
)
const { handleSubmit, values, setFieldValue, setValues, resetForm, isFieldDirty } = useForm({
  validationSchema: formSchema
})

// 建议的相片元数据
const metadata = ref<PhotoMetadata>({})
const parseLoading = ref(false)
const handleParseMetadata = async () => {
  if (!values.imageUrl) return

  try {
    parseLoading.value = true
    const res = await request.post<PhotoMetadata>('/gallery/photo/parse-from-url', {
      url: values.imageUrl
    })

    metadata.value = res.data
  } catch (error: any) {
    console.error(error.message)
  } finally {
    parseLoading.value = false
  }
}
const handleFill = (type: string) => {
  setFieldValue(type as any, metadata.value[type as keyof PhotoMetadata] || '')
}

const { filterList } = useFilterLocal('ALL')
const locationList = computed(() => {
  return filterList.value.find((item) => item.type === 'LOCATION')?.list || []
})
const cameraList = computed(() => {
  return filterList.value.find((item) => item.type === 'CAMERA')?.list || []
})
const lensesList = computed(() => {
  return filterList.value.find((item) => item.type === 'LENS')?.list || []
})

const calendarValue = ref<DateValue | DateValue[] | undefined>()
const calendarShow = ref(false)
watchEffect(() => {
  setFieldValue('shootingTimeAt', calendarValue.value?.toString() || '')
})

const show = ref(false)
const handleUpload = (photo?: Photo) => {
  if (photo) {
    setValues({
      _id: photo._id,
      imageUrl: photo.imageUrl,
      aperture: photo.aperture || '',
      shutter: photo.shutter || '',
      focalLength: photo.focalLength || '',
      ISO: photo.ISO || '',
      title: photo.title || '',
      description: photo.description || '',
      shootingTimeAt: photo.shootingTimeAt || '',
      location: photo.location?._id || '',
      camera: photo.camera?._id || '',
      lenses: photo.lenses?._id || ''
    })
  } else {
    setValues({
      _id: '',
      imageUrl: '',
      aperture: '',
      shutter: '',
      focalLength: '',
      ISO: '',
      title: '',
      description: '',
      shootingTimeAt: '',
      location: '',
      camera: '',
      lenses: ''
    })
  }

  show.value = true
}
const handleCancel = () => {
  show.value = false
  resetForm()
}
const onSubmit = handleSubmit((values) => {
  show.value = false
  resetForm()
  emit('submit', values)
})

watchEffect(() => {
  emit('openChange', show.value)
})

defineExpose({
  handleUpload
})
</script>

<style scoped></style>

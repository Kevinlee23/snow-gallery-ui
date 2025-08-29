<template>
  <Sheet v-model:open="show">
    <SheetContent :class="{ 'bg-gray-500/80': isDarkMode }" class="flex !w-[700px] !max-w-[700px] flex-col">
      <SheetHeader>
        <SheetTitle :class="{ 'text-white': isDarkMode }">
          相片上传
          <span v-if="values._id" class="text-[12px] text-gray-500/80">
            {{ values._id }}
          </span>
        </SheetTitle>
        <SheetDescription :class="{ 'text-white': isDarkMode }"> 相片上传/修改 </SheetDescription>
      </SheetHeader>

      <form id="photo-upload-form" class="grid flex-1 grid-cols-2 gap-4" @submit="onSubmit">
        <div class="flex flex-col gap-4">
          <div class="w-fit border-b-[2px] border-b-black text-[16px] font-bold" :class="{ 'border-b-white text-white': isDarkMode }">基础信息</div>
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
          <FormField v-slot="{ field }" name="title" :validate-on-blur="!isFieldDirty">
            <FormItem>
              <FormControl>
                <Input id="title" v-bind="field" autocomplete="off" placeholder="标题" class="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ field }" name="description">
            <FormItem>
              <FormControl>
                <Textarea id="description" v-bind="field" autocomplete="off" placeholder="描述" class="bg-white" />
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
                    class="!cursor-text border-none bg-white disabled:!text-black disabled:!opacity-100"
                  />
                  <div class="h-6 w-px bg-border"></div>
                  <Popover v-model:open="calendarShow">
                    <PopoverTrigger as-child>
                      <div class="cursor-pointer p-2">
                        <CalendarIcon :size="16" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                      <Calendar v-model="calendarValue" @update:model-value="calendarShow = false" />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
          <div v-if="metadata.shootingTimeAt" class="text-right text-[14px]" :class="{ 'text-white': isDarkMode, 'text-gray-500/80': !isDarkMode }">
            metadata: {{ metadata.shootingTimeAt }}
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="w-fit border-b-[2px] border-b-black text-[16px] font-bold" :class="{ 'border-b-white text-white': isDarkMode }">设备信息</div>

          <FormField v-slot="{ field }" name="location">
            <FormItem>
              <FormControl>
                <Select :model-value="field.value" @update:model-value="field.onChange" autocomplete="off" placeholder="拍摄地点">
                  <SelectTrigger class="bg-white">
                    <SelectValue placeholder="选择拍摄地点" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="item in locationList"
                      :key="item.value"
                      :value="item.value"
                      :class="{ 'font-bold': field.value === item.value }"
                      >{{ item.label }}
                    </SelectItem>
                    <div v-if="locationList.length === 0" class="text-center text-[14px] text-gray-500/80">暂无地点</div>
                    <div class="to-create">
                      <a href="/locations" target="_blank" class="link">
                        去创建
                        <SquareArrowOutUpRight :size="16" />
                      </a>
                    </div>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          </FormField>
          <FormField v-slot="{ field }" name="camera">
            <FormItem>
              <FormControl>
                <Select :model-value="field.value" @update:model-value="field.onChange" placeholder="相机">
                  <SelectTrigger class="bg-white">
                    <SelectValue placeholder="选择相机" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="item in cameraList" :key="item.value" :value="item.value" :class="{ 'font-bold': field.value === item.value }">
                      {{ item.label }}
                    </SelectItem>
                    <div v-if="cameraList.length === 0" class="text-center text-[14px] text-gray-500/80">暂无相机</div>
                    <div class="to-create">
                      <a href="/device" target="_blank" class="link">
                        去创建
                        <SquareArrowOutUpRight :size="16" />
                      </a>
                    </div>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          </FormField>
          <div v-if="metadata.cameraName" class="text-right text-[14px]" :class="{ 'text-white': isDarkMode, 'text-gray-500/80': !isDarkMode }">
            metadata: {{ metadata.cameraName }}
          </div>
          <FormField v-slot="{ field }" name="lenses">
            <FormItem>
              <FormControl>
                <Select :model-value="field.value" @update:model-value="field.onChange" autocomplete="off" placeholder="镜头">
                  <SelectTrigger class="bg-white">
                    <SelectValue placeholder="选择镜头" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="item in lensesList" :key="item.value" :value="item.value" :class="{ 'font-bold': field.value === item.value }">
                      {{ item.label }}
                    </SelectItem>
                    <div v-if="lensesList.length === 0" class="text-center text-[14px] text-gray-500/80">暂无镜头</div>
                    <div class="to-create">
                      <a href="/device" target="_blank" class="link">
                        去创建
                        <SquareArrowOutUpRight :size="16" />
                      </a>
                    </div>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          </FormField>
          <div v-if="metadata.lensesName" class="text-right text-[14px]" :class="{ 'text-white': isDarkMode, 'text-gray-500/80': !isDarkMode }">
            metadata: {{ metadata.lensesName }}
          </div>
          <div class="flex justify-end">
            <div
              class="group flex w-fit cursor-pointer items-center gap-x-2 text-[14px]"
              :class="{ 'text-white': isDarkMode }"
              @click="refreshFilter"
            >
              重新拉取地点和设备
              <Loader :size="16" class="group-hover:animate-spin" style="animation-duration: 1.5s" />
            </div>
          </div>

          <div class="w-fit border-b-[2px] border-b-black text-[16px] font-bold" :class="{ 'border-b-white text-white': isDarkMode }">摄影要素</div>
          <FormField v-slot="{ field }" name="aperture">
            <FormItem>
              <FormControl>
                <div class="group relative">
                  <Input id="aperture" v-bind="field" autocomplete="off" placeholder="光圈" class="bg-white" />
                  <div class="input-tip" :class="{ 'opacity-100': field.value, 'opacity-0': !field.value }">光圈</div>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
          <div v-if="metadata.aperture" class="text-right text-[14px]" :class="{ 'text-white': isDarkMode, 'text-gray-500/80': !isDarkMode }">
            metadata: {{ metadata.aperture }}
            <span
              class="ml-2 cursor-pointer text-[12px] text-black hover:text-gray-500/80"
              :class="{ 'font-bold': isDarkMode }"
              @click="handleFill('aperture')"
            >
              Fill
            </span>
          </div>
          <FormField v-slot="{ field }" name="shutter">
            <FormItem>
              <FormControl>
                <div class="group relative">
                  <Input id="shutter" v-bind="field" autocomplete="off" placeholder="快门" class="bg-white" />
                  <div class="input-tip" :class="{ 'opacity-100': field.value, 'opacity-0': !field.value }">快门</div>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
          <div v-if="metadata.shutter" class="text-right text-[14px]" :class="{ 'text-white': isDarkMode, 'text-gray-500/80': !isDarkMode }">
            metadata: {{ metadata.shutter }}
            <span
              class="ml-2 cursor-pointer text-[12px] text-black hover:text-gray-500/80"
              :class="{ 'font-bold': isDarkMode }"
              @click="handleFill('shutter')"
              >Fill</span
            >
          </div>
          <FormField v-slot="{ field }" name="focalLength">
            <FormItem>
              <FormControl>
                <div class="group relative">
                  <Input id="focalLength" v-bind="field" autocomplete="off" placeholder="焦距" class="bg-white" />
                  <div class="input-tip" :class="{ 'opacity-100': field.value, 'opacity-0': !field.value }">焦距</div>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
          <div v-if="metadata.focalLength" class="text-right text-[14px]" :class="{ 'text-white': isDarkMode, 'text-gray-500/80': !isDarkMode }">
            metadata: {{ metadata.focalLength }}
            <span
              class="ml-2 cursor-pointer text-[12px] text-black hover:text-gray-500/80"
              :class="{ 'font-bold': isDarkMode }"
              @click="handleFill('focalLength')"
              >Fill</span
            >
          </div>
          <FormField v-slot="{ field }" name="ISO">
            <FormItem>
              <FormControl>
                <div class="group relative">
                  <Input id="ISO" v-bind="field" autocomplete="off" placeholder="ISO" class="bg-white" />
                  <div class="input-tip" :class="{ 'opacity-100': field.value, 'opacity-0': !field.value }">ISO</div>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
          <div v-if="metadata.ISO" class="text-right text-[14px]" :class="{ 'text-white': isDarkMode, 'text-gray-500/80': !isDarkMode }">
            metadata: {{ metadata.ISO }}
            <span
              class="ml-2 cursor-pointer text-[12px] text-black hover:text-gray-500/80"
              :class="{ 'font-bold': isDarkMode }"
              @click="handleFill('ISO')"
              >Fill</span
            >
          </div>
        </div>
      </form>

      <SheetFooter>
        <Popover v-if="values._id">
          <PopoverTrigger as-child>
            <Button variant="destructive" @click.stop> 删除 </Button>
          </PopoverTrigger>
          <PopoverContent class="flex flex-col gap-y-2">
            <div>
              确定删除:
              <span class="ml-2 text-[14px] font-bold"> {{ values.title }} </span>
              ?
            </div>
            <Input v-model="deleteName" placeholder="请输入相片标题" />
            <Button variant="destructive" @click="handleDelete" :disabled="deleteName !== values.title"> 确定删除 </Button>
          </PopoverContent>
        </Popover>
        <Button type="submit" form="photo-upload-form"> {{ values._id ? '更新' : '上传' }} </Button>
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
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { LoaderCircle, Dna, Calendar as CalendarIcon, SquareArrowOutUpRight, Loader } from 'lucide-vue-next'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { FormField, FormControl, FormItem, FormMessage } from '@/components/ui/form'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFilterLocal } from '@/hooks/use-filter-local'
import { usePhotosState } from '@/hooks/use-photos-state'
import request from '@/utils/request'

const emit = defineEmits(['submit', 'openChange', 'delete'])

const { isDarkMode } = usePhotosState()

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

// 设备数据
const { filterList, getFilterList } = useFilterLocal('ALL')
const locationList = computed(() => {
  return filterList.value.find((item) => item.type === 'LOCATION')?.list || []
})
const cameraList = computed(() => {
  return filterList.value.find((item) => item.type === 'CAMERA')?.list || []
})
const lensesList = computed(() => {
  return filterList.value.find((item) => item.type === 'LENS')?.list || []
})
const refreshFilter = async () => {
  await getFilterList()
  toast.success('重新拉取地点和设备成功')
}

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

  metadata.value = {}
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

const deleteName = ref('')
const handleDelete = () => {
  emit('delete')
}

watchEffect(() => {
  emit('openChange', show.value)
})

defineExpose({
  handleUpload
})
</script>

<style lang="scss" scoped>
.to-create {
  @apply ml-2 flex justify-end py-2 text-[14px] text-gray-500/80;

  .link {
    @apply flex w-fit items-center gap-x-1;
  }
}

.input-tip {
  @apply absolute right-4 top-[50%] translate-y-[-50%] text-gray-500/80 transition-[opacity] duration-500 group-hover:font-bold group-hover:text-black;
}
</style>

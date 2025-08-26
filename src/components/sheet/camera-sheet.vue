<template>
  <Sheet v-model:open="show">
    <SheetContent :class="{ 'bg-gray-500/80': isDarkMode }">
      <SheetHeader>
        <SheetTitle :class="{ 'text-white': isDarkMode }">
          相机
          <span v-if="values._id" class="text-[12px] text-gray-500/80">
            {{ values._id }}
          </span>
        </SheetTitle>
        <SheetDescription :class="{ 'text-white': isDarkMode }"> 相机创建/更新 </SheetDescription>
      </SheetHeader>

      <form id="camera-form" class="flex flex-col gap-4 py-4" @submit="onSubmit">
        <FormField v-slot="{ field }" name="fullName" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Input id="fullName" v-bind="field" autocomplete="off" placeholder="相机型号" class="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="imageUrl" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Input id="imageUrl" v-bind="field" autocomplete="off" placeholder="相机图片" class="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="flex flex-col gap-y-2">
          <FormField v-slot="{ field }" name="isSLR">
            <FormItem>
              <FormControl>
                <Select id="isSLR" :model-value="field.value" @update:model-value="field.onChange">
                  <SelectTrigger class="bg-white">
                    <SelectValue placeholder="选择是否是单反相机" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1" :class="{ 'font-bold': field.value === '1' }">是</SelectItem>
                    <SelectItem value="0" :class="{ 'font-bold': field.value === '0' }">否</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <div
            v-if="values.isSLR"
            class="w-full cursor-pointer text-right text-gray-500/80 hover:text-black"
            @click="() => setFieldValue('isSLR', '')"
          >
            clear
          </div>
        </div>
        <FormField v-slot="{ field }" name="frameSize">
          <FormItem>
            <FormControl>
              <Input id="frameSize" v-bind="field" autocomplete="off" placeholder="相机画幅" class="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="brandRef" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Select id="brandRef" :model-value="field.value" @update:model-value="field.onChange">
                <SelectTrigger class="bg-white">
                  <SelectValue placeholder="选择品牌" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="brand in brands" :key="brand._id" :value="brand._id" :class="{ 'font-bold': field.value === brand._id }">
                    {{ brand.name }}
                  </SelectItem>
                  <div v-if="brands.length === 0" class="text-center text-[14px] text-gray-500/80">暂无品牌</div>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="releaseDateAt">
          <FormItem>
            <FormControl>
              <div
                class="flex items-center overflow-hidden rounded-md border border-input bg-white transition-[border] duration-300"
                :class="{ 'border-black': calendarShow }"
              >
                <Input
                  id="releaseDateAt"
                  :model-value="field.value"
                  @update:model-value="field.onChange"
                  disabled
                  placeholder="发布日期"
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
            <FormMessage />
          </FormItem>
        </FormField>
      </form>

      <SheetFooter>
        <Popover v-if="values._id">
          <PopoverTrigger as-child>
            <Button variant="destructive" @click.stop> 删除 </Button>
          </PopoverTrigger>
          <PopoverContent class="flex flex-col gap-y-2">
            <div>
              确定删除:
              <span class="ml-2 text-[14px] font-bold"> {{ values.fullName }} </span>
              ?
            </div>
            <Input v-model="deleteName" placeholder="请输入相机型号" />
            <Button variant="destructive" @click="handleDelete" :disabled="deleteName !== values.fullName"> 确定删除 </Button>
          </PopoverContent>
        </Popover>
        <Button type="submit" form="camera-form"> {{ values._id ? '更新' : '创建' }} </Button>
        <Button variant="outline" @click="handleCancel"> 取消 </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script lang="ts" setup>
import type { Brand, Camera } from '@/types/device'
import type { DateValue } from '@internationalized/date'

import { ref, watch, type PropType } from 'vue'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePhotosState } from '@/hooks/use-photos-state'

defineProps({
  brands: { type: Array as PropType<Brand[]>, default: () => [] }
})

const emit = defineEmits(['submit', 'delete'])

const { isDarkMode } = usePhotosState()

const formSchema = toTypedSchema(
  z.object({
    _id: z.string().optional(),
    fullName: z.string().nonempty('相机型号不能为空'),
    imageUrl: z.string().nonempty('相机图片不能为空'),
    isSLR: z.string(),
    frameSize: z.string(),
    brandRef: z.string().nonempty('品牌不能为空'),
    releaseDateAt: z.string().nonempty('发布日期不能为空')
  })
)
const { values, handleSubmit, isFieldDirty, setFieldValue, setValues, resetForm } = useForm({
  validationSchema: formSchema
})

const calendarShow = ref(false)
const calendarValue = ref<DateValue | DateValue[] | undefined>()
watch(
  () => calendarValue.value,
  () => {
    setFieldValue('releaseDateAt', calendarValue.value?.toString() || '')
  }
)

const show = ref(false)
const handleOpen = (camera?: Camera) => {
  if (camera) {
    setValues({
      _id: camera._id,
      fullName: camera.fullName,
      imageUrl: camera.imageUrl,
      isSLR: camera.isSLR,
      frameSize: camera.frameSize,
      releaseDateAt: camera.releaseDateAt,
      brandRef: camera.brandRef._id
    })
  } else {
    setValues({
      _id: '',
      fullName: '',
      imageUrl: '',
      isSLR: '',
      frameSize: '',
      brandRef: '',
      releaseDateAt: ''
    })
  }

  show.value = true
}

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
  show.value = false
  resetForm()
})
const handleCancel = () => {
  show.value = false
  resetForm()
}

const deleteName = ref('')
const handleDelete = () => {
  emit('delete', values._id)
  show.value = false
  deleteName.value = ''
}

defineExpose({
  handleOpen
})
</script>

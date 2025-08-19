<template>
  <Sheet v-model:open="show">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>相册</SheetTitle>
        <SheetDescription> 相册创建/更新 </SheetDescription>
      </SheetHeader>

      <form id="album-form" class="flex flex-col gap-4 py-4" @submit="onSubmit">
        <FormField v-slot="{ field }" name="title" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Input id="title" v-bind="field" autocomplete="off" placeholder="相册名称" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="description">
          <FormItem>
            <FormControl>
              <Textarea id="description" v-bind="field" placeholder="相册描述" />
            </FormControl>
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="public" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Select :model-value="field.value" @update:model-value="field.onChange" placeholder="公开状态">
                <SelectTrigger>
                  <SelectValue placeholder="选择公开状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">公开</SelectItem>
                  <SelectItem value="0">私密</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="coverRef" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <div class="flex items-center overflow-hidden rounded-md border border-input bg-white transition-[border] duration-300">
                <div
                  class="flex h-[36px] flex-1 items-center px-3 py-1 text-[14px]/[20px]"
                  :class="{ 'text-gray-500/80': !field.value || field.value.length === 0 }"
                >
                  {{ field.value && field.value.length >= 1 ? `已选择封面` : `选择封面` }}
                </div>
                <div class="h-6 w-px bg-border"></div>
                <div class="p-2">
                  <SquareMousePointer class="cursor-pointer" :size="16" @click="() => handleOpenPhotosDialog('cover')" />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ field }" name="photos" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <div class="flex items-center overflow-hidden rounded-md border border-input bg-white transition-[border] duration-300">
                <div
                  class="flex h-[36px] flex-1 items-center px-3 py-1 text-[14px]/[20px]"
                  :class="{ 'text-gray-500/80': !field.value || field.value.length === 0 }"
                >
                  {{ field.value && field.value.length >= 1 ? `已选择 ${field.value.length} 张相片` : `选择相片` }}
                </div>
                <div class="h-6 w-px bg-border"></div>
                <div class="p-2">
                  <SquareMousePointer class="cursor-pointer" :size="16" @click="() => handleOpenPhotosDialog('photos')" />
                </div>
              </div>
            </FormControl>
          </FormItem>
        </FormField>
      </form>

      <Dialog v-model:open="showPhotosDialog">
        <DialogContent class="!w-[1080px] !max-w-[1080px]">
          <DialogHeader>
            <DialogTitle>{{ selectType === 'cover' ? '封面' : '相片' }}</DialogTitle>
            <DialogDescription> 选择{{ selectType === 'cover' ? '封面(单选)' : '相片(多选)' }} </DialogDescription>
          </DialogHeader>
          <PhotosList
            :photos="photos"
            :isPending="isPending"
            :hasNextPage="hasNextPage"
            :layoutActive="'grid'"
            :selectMode="true"
            :selectPhotos="selectedPhotos"
            @onFetchNextPage="fetchNextPage"
            @select="handleSelectPhoto"
          />

          <DialogFooter>
            <Button variant="outline" @click="showPhotosDialog = false"> 取消 </Button>
            <Button @click="handleConfirmPhotosDialog"> 确定 </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SheetFooter>
        <Button type="submit" form="album-form"> 提交 </Button>
        <Button variant="outline" @click="handleCancel"> 取消 </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script lang="tsx" setup>
import type { Photo } from '@/types/photos'
import type { Response } from '@/types/response'

import { computed, ref, watchEffect } from 'vue'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { SquareMousePointer } from 'lucide-vue-next'
import { useInfiniteQuery } from '@tanstack/vue-query'
import PhotosList from '@/components/photos-ui/photos-list.vue'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import request from '@/utils/request'

const emit = defineEmits(['submit', 'openChange'])

const formSchema = toTypedSchema(
  z.object({
    title: z.string().nonempty('相册名称不能为空'),
    description: z.string(),
    public: z.string().nonempty('公开状态不能为空'),
    coverRef: z.string().nonempty('封面不能为空'),
    photos: z.array(z.string())
  })
)
const { handleSubmit, values, setFieldValue, setValues, resetForm, isFieldDirty } = useForm({
  validationSchema: formSchema
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
  show.value = false
  resetForm()
})

const show = ref(false)
const handleOpen = () => {
  show.value = true

  setValues({
    title: '',
    description: '',
    public: '1',
    coverRef: '',
    photos: []
  })
}
const handleCancel = () => {
  show.value = false
  resetForm()
}

// 选择相簿的封面或者相片列表
const showPhotosDialog = ref(false)
const selectedPhotos = ref<string[]>([])
const selectType = ref<'cover' | 'photos'>()
const handleOpenPhotosDialog = (type: 'cover' | 'photos') => {
  showPhotosDialog.value = true
  selectType.value = type
  if (type === 'cover') {
    selectedPhotos.value = values.coverRef ? [values.coverRef] : []
  } else {
    selectedPhotos.value = [...(values.photos || [])]
  }
}
const handleSelectPhoto = (id: string) => {
  if (selectedPhotos.value.includes(id)) {
    selectedPhotos.value = selectedPhotos.value.filter((item) => item !== id)
  } else {
    if (selectType.value === 'cover') {
      selectedPhotos.value = [id]
    } else {
      selectedPhotos.value.push(id)
    }
  }
}
const handleConfirmPhotosDialog = () => {
  if (selectType.value === 'cover') {
    setFieldValue('coverRef', selectedPhotos.value.length > 0 ? selectedPhotos.value[0] : '')
  } else {
    setFieldValue('photos', selectedPhotos.value)
  }
  showPhotosDialog.value = false
}

const limit = 8
const total = ref(0)
// 拉取相片列表
const fetchPhotos = async (page: number = 1) => {
  const res: Response<{ list: Photo[]; total: number }> = await request.post('/gallery/photo/list', {
    limit,
    sort: [{ field: 'createTime', order: 'desc' }],
    offset: page - 1
  })

  total.value = res.data.total
  return res.data.list
}
const { data, isPending, hasNextPage, fetchNextPage } = useInfiniteQuery<Photo[]>({
  queryKey: ['photos'],
  queryFn: ({ pageParam }) => fetchPhotos(pageParam as number),
  getNextPageParam: (_, pages) => {
    const currentPage = pages.length
    const totalPages = Math.ceil(total.value / limit)
    return currentPage < totalPages ? currentPage + 1 : undefined
  },
  initialPageParam: 1
})
const photos = computed(() => data.value?.pages.flatMap((page) => page) || [])

watchEffect(() => {
  emit('openChange', show.value)
})

defineExpose({
  handleOpen
})
</script>

<style lang="scss" scoped></style>

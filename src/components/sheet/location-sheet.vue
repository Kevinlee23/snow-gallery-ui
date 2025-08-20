<template>
  <Sheet v-model:open="show">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>
          地点
          <span v-if="values._id" class="text-[12px] text-gray-500/80">
            {{ values._id }}
          </span>
        </SheetTitle>
        <SheetDescription>地点创建/更新</SheetDescription>
      </SheetHeader>

      <form id="location-form" class="flex flex-col gap-4 py-4" @submit="onSubmit">
        <FormField v-slot="{ field }" name="fullName" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Input id="fullName" v-bind="field" autocomplete="off" placeholder="地点名称" />
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
            <Input v-model="deleteName" placeholder="请输入地点名称" />
            <Button variant="destructive" @click="handleDelete" :disabled="deleteName !== values.fullName"> 确定删除 </Button>
          </PopoverContent>
        </Popover>
        <Button type="submit" form="location-form"> {{ values._id ? '更新' : '创建' }} </Button>
        <Button variant="outline" @click="handleCancel"> 取消 </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script lang="ts" setup>
import type { Location } from '@/types/location'

import { ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Input } from '@/components/ui/input'
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const emit = defineEmits(['submit', 'delete'])

const formSchema = toTypedSchema(
  z.object({
    _id: z.string().optional(),
    fullName: z.string().nonempty('地点名称不能为空')
  })
)

const { values, handleSubmit, setValues, isFieldDirty, resetForm } = useForm({
  validationSchema: formSchema
})

const show = ref(false)
const handleOpen = (location?: Location) => {
  if (location) {
    setValues({
      _id: location._id,
      fullName: location.fullName
    })
  } else {
    setValues({
      _id: '',
      fullName: ''
    })
  }

  show.value = true
}
const onSubmit = handleSubmit(async (values) => {
  emit('submit', values)
  show.value = false
  resetForm()
})
const handleCancel = () => {
  show.value = false
  resetForm()
}

// 需要输入地点名称才能点击删除按钮
const deleteName = ref('')
const handleDelete = () => {
  show.value = false
  deleteName.value = ''
  emit('delete', values._id)
}

defineExpose({
  handleOpen
})
</script>

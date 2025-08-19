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
        <Button type="submit" form="location-form"> 提交 </Button>
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
import { Button } from '@/components/ui/button'

const emit = defineEmits(['submit'])

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

defineExpose({
  handleOpen
})
</script>

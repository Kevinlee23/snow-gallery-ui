<template>
  <Sheet v-model:open="show">
    <SheetContent :class="{ 'bg-gray-500/80': isDarkMode }">
      <SheetHeader>
        <SheetTitle :class="{ 'text-white': isDarkMode }"> 登陆 </SheetTitle>
        <SheetDescription :class="{ 'text-white': isDarkMode }"> 这是一个登陆操作 </SheetDescription>
      </SheetHeader>

      <form id="login-form" class="flex flex-col gap-4 py-4" @submit="onSubmit">
        <FormField name="username" v-slot="{ field }" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Input id="name" v-bind="field" type="text" autocomplete="off" placeholder="用户名" class="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField name="password" v-slot="{ field }" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormControl>
              <Input id="username" v-bind="field" type="password" autocomplete="off" placeholder="密码" class="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </form>

      <SheetFooter class="gap-y-2">
        <Button type="submit" form="login-form"> 登陆 </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePhotosState } from '@/hooks/use-photos-state'

const emit = defineEmits(['submit', 'openChange'])

const { isDarkMode } = usePhotosState()

const formSchema = toTypedSchema(
  z.object({
    username: z.string().nonempty('用户名不能为空'),
    password: z.string().nonempty('密码不能为空')
  })
)

const { handleSubmit, isFieldDirty } = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: '',
    password: ''
  }
})

const show = ref(false)
const handleLogin = () => {
  show.value = true
}
const onSubmit = handleSubmit((values) => {
  show.value = false
  emit('submit', values)
})

watchEffect(() => {
  emit('openChange', show.value)
})

defineExpose({
  handleLogin
})
</script>

<style scoped></style>

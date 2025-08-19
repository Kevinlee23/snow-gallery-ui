<template>
  <Sheet v-model:open="show">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>登陆</SheetTitle>
        <SheetDescription> 这是一个登陆操作 </SheetDescription>
      </SheetHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right"> 用户名 </Label>
          <Input id="name" v-model="username" type="text" autocomplete="off" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="username" class="text-right"> 密码 </Label>
          <Input id="username" v-model="password" type="password" autocomplete="off" class="col-span-3" />
        </div>
      </div>

      <SheetFooter>
        <Button @click="handleSubmit"> 登陆 </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const emit = defineEmits(['submit', 'openChange'])

const show = ref(false)
const username = ref('')
const password = ref('')

const handleLogin = () => {
  show.value = true
}

const handleSubmit = () => {
  show.value = false
  emit('submit', {
    username: username.value,
    password: password.value
  })
}

watchEffect(() => {
  emit('openChange', show.value)
})

defineExpose({
  handleLogin
})
</script>

<style scoped></style>

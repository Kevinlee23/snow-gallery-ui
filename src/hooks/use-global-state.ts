import type { Response } from '@/types/response'

import { ref } from 'vue'
import request from '@/utils/request'
import { toast } from 'vue-sonner'

type LoginData = {
  username: string
  password: string
}

const globalState = ref({
  isLoggin: false,
  token: ''
})

export const useGlobalState = () => {
  const globalInit = () => {
    const token = localStorage.getItem('token')

    if (token) {
      globalState.value.isLoggin = true
      globalState.value.token = token
    }
  }

  const handleLoginSubmit = async (data: LoginData) => {
    const res: Response<string> = await request.post('/auth/signin', data)

    toast.success(res.message)

    globalState.value.isLoggin = true
    globalState.value.token = res.data
    localStorage.setItem('token', res.data)
  }

  return {
    globalState,
    globalInit,
    handleLoginSubmit
  }
}

export type Response<T = null> = {
  code: number
  data: T
  message: string
}

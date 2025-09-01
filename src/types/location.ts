export type Location = {
  _id: string
  fullName: string
  coordinate?: [number, number]
  photoCount: number
}

export type LocationCreate = {
  _id?: string
  fullName: string
  coordinate?: [number, number]
  photoCount?: number
}

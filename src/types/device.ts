export type BrandType = 'Camera' | 'Lensens' | 'Phone'
export type Brand = {
  _id: string
  name: string
  type: BrandType
  logo: string
  description: string
}

export type Camera = {
  _id: string
  fullName: string
  imageUrl: string
  isSLR: string
  frameSize: string
  releaseDateAt: string

  brandRef: {
    _id: string
    name: string
  }
}

export type Lenses = {
  _id: string
  fullName: string
  isOriginal: string
  isFocusLenses: string
  focalLengths: string
  brandRef: Brand | string
}

export type CameraCreate = {
  _id?: string
  fullName: string
  imageUrl: string
  isSLR?: string
  frameSize?: string
  releaseDateAt: string
  brandRef: string
}

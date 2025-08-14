import type { FilterIconMapType, FilterMapType, ShareMapType } from '@/types/photos'

import { CalendarDays, Camera, Aperture, Film, MapPin } from 'lucide-vue-next'

export const prefix = 'https://gallery.snowinlu.com'

export const filterIconMap: FilterIconMapType = {
  YEAR: CalendarDays,
  CAMERA: Camera,
  LENS: Aperture,
  ALBUM: Film,
  LOCATION: MapPin
}

export const filterMap: FilterMapType = {
  YEAR: '拍摄年份',
  CAMERA: '相机型号',
  LENS: '镜头型号',
  ALBUM: '归属相簿',
  LOCATION: '拍摄地点'
}
export const filterLinkMap: FilterMapType = {
  YEAR: '/year',
  CAMERA: '/camera',
  LENS: '/lenses',
  ALBUM: '/album',
  LOCATION: '/location'
}

export const shareMap: ShareMapType = {
  YEAR: `year`,
  CAMERA: `camera`,
  LENS: `lenses`,
  ALBUM: `album`,
  LOCATION: `location`,
  PHOTO: `p`
}
export const totalDescribMap: FilterMapType = {
  YEAR: 'Photos taken in',
  CAMERA: 'Photos taken with',
  LENS: 'Photos taken with',
  ALBUM: 'Photos taken in',
  LOCATION: 'Photos taken in'
}

import type { FilterIconMapType, FilterMapType, ShareMapType } from '@/types/photos'

import { CalendarDays, Camera, Aperture, Film, MapPin } from 'lucide-vue-next'

export const PREFIX = 'https://gallery.snowinlu.top'

export const FILTER_ICON_MAP: FilterIconMapType = {
  YEAR: CalendarDays,
  CAMERA: Camera,
  LENS: Aperture,
  ALBUM: Film,
  LOCATION: MapPin
}

export const FILTER_MAP: FilterMapType = {
  YEAR: '拍摄年份',
  CAMERA: '相机型号',
  LENS: '镜头型号',
  ALBUM: '归属相簿',
  LOCATION: '拍摄地点'
}
export const FILTER_LINK_MAP: FilterMapType = {
  YEAR: '/year',
  CAMERA: '/camera',
  LENS: '/lenses',
  ALBUM: '/album',
  LOCATION: '/location'
}

export const FILTER_PAGE_MAP: FilterMapType = {
  YEAR: '',
  CAMERA: '/device',
  LENS: '/device',
  ALBUM: '/gallerys',
  LOCATION: '/locations'
}

export const SHARE_MAP: ShareMapType = {
  YEAR: `year`,
  CAMERA: `camera`,
  LENS: `lenses`,
  ALBUM: `album`,
  LOCATION: `location`,
  PHOTO: `p`
}
export const TOTAL_DESCRIBE_MAP: FilterMapType = {
  YEAR: 'Photos taken in',
  CAMERA: 'Photos taken with',
  LENS: 'Photos taken with',
  ALBUM: 'Photos taken in',
  LOCATION: 'Photos taken in'
}

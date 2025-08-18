import type { FunctionalComponent } from 'vue'
import type { LucideProps } from 'lucide-vue-next'

export type LayoutType = 'grid' | 'list' | 'filter' | 'item' | 'select'
export type SortType = 'createdTimeDesc' | 'createdTimeAsc' | 'shootingTimeDesc' | 'shootingTimeAsc'
export type ThemeType = 'light' | 'dark' | 'System'

export type FilterType = 'YEAR' | 'CAMERA' | 'LENS' | 'ALBUM' | 'LOCATION'
export type FilterMapType = Record<FilterType, string>
export type FilterIconMapType = Record<FilterType, FunctionalComponent<LucideProps, {}, any, {}>>
export type FilterGroupItem = { type: FilterType; list: { label: string; value: string; total: number }[] }

export type ShareType = 'PHOTO' | FilterType
export type ShareMapType = Record<ShareType, string>

export type Photo = {
  _id: string
  imageUrl: string
  aperture?: string
  shutter?: string
  focalLength?: string
  ISO?: string
  title: string
  description?: string
  shootingTimeAt?: string
  location?: {
    _id: string
    fullName: string
    // 根据实际Location schema添加其他字段
  }
  camera?: {
    _id: string
    fullName: string
    // 根据实际Camera schema添加其他字段
  }
  lenses?: {
    _id: string
    fullName: string
    // 根据实际Lenses schema添加其他字段
  }
  createTime?: string
}

export type PhotoCreate = {
  _id?: string
  imageUrl: string
  aperture?: string
  shutter?: string
  focalLength?: string
  ISO?: string
  title: string
  description?: string
  shootingTimeAt?: string
  location?: string
  camera?: string
  lenses?: string
}

export type ShareItem = {
  _id: string
  title: string
  total: number
  cover: string
}

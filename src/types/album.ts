import type { Photo } from './photos'

export type Album = {
  _id: string
  isDel: string
  title: string
  public: string
  coverRef: { _id: string; imageUrl: string }
  photos?: string[] | Photo[]
  createTime: string
}

export type AlbumsWithYear = {
  year: string
  albums: Album[]
}

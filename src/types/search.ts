export type SearchItem = {
  _id: string
  title: string
  total?: number
}
export type SearchResult = {
  PHOTOS?: (SearchItem & { imageUrl: string; shootingTimeAt: string })[]
  ALBUM?: SearchItem[]
  LOCATION?: SearchItem[]
  CAMERA?: SearchItem[]
  LENSES?: SearchItem[]
}

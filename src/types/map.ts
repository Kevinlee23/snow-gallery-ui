import type { Ref } from 'vue'

export interface MapLocation {
  _id: string
  fullName: string
  coordinate: [number, number] // [lat, lng]
  photoCount: number
}

export interface MapPosition {
  lat: number
  lng: number
}

export interface MapMarker {
  id: string
  position: MapPosition
  title: string
  content: string
  location: MapLocation
}

export interface MapConfig {
  containerId: string
  center: MapPosition
  zoom: number
  isDarkMode?: boolean
}

export interface MapControls {
  showZoomControl?: boolean
  showLocateControl?: boolean
  showZoomLevelDisplay?: boolean
  zoomControlPosition?: 'topright' | 'topleft' | 'bottomright' | 'bottomleft'
}

export interface LocationUpdateEvent {
  lat: number
  lng: number
  accuracy?: number
}

export interface MapEventHandlers {
  onLocationFound?: (event: LocationUpdateEvent) => void
  onLocationError?: (error: { code: number; message: string }) => void
  onZoomEnd?: (zoom: number) => void
  onMarkerClick?: (marker: MapMarker) => void
}

// 统一的地图实例接口
export interface MapInstance {
  // 基础地图操作
  setView(center: MapPosition, zoom: number): void
  getCenter(): MapPosition
  getZoom(): number
  flyTo(center: MapPosition, zoom?: number): void
  
  // 标记点管理
  addMarker(marker: MapMarker): void
  removeMarker(markerId: string): void
  clearMarkers(): void
  updateMarkerContent(markerId: string, content: string): void
  
  // 定位功能
  getCurrentLocation(): Promise<MapPosition>
  enableLocationTracking(): void
  disableLocationTracking(): void
  
  // 样式和主题
  setDarkMode(isDark: boolean): void
  
  // 生命周期
  destroy(): void
  
  // 原始地图实例（用于高级操作）
  getNativeMap(): any
}

export type MapProvider = 'leaflet' | 'mapbox'

export interface MapHookOptions {
  provider?: MapProvider
  config: MapConfig
  controls?: MapControls
  handlers?: MapEventHandlers
  locations?: MapLocation[]
  autoFitBounds?: boolean
}

export interface MapHookReturn {
  mapInstance: Ref<MapInstance | null>
  isMapReady: Ref<boolean>
  currentLocation: Ref<MapPosition | null>
  isLocating: Ref<boolean>
  markers: Ref<MapMarker[]>
  
  // 方法
  initMap: () => Promise<void>
  destroyMap: () => void
  addLocationMarkers: (locations: MapLocation[]) => void
  clearAllMarkers: () => void
  flyToLocation: (location: MapPosition, zoom?: number) => void
  startLocationTracking: () => void
  stopLocationTracking: () => void
  toggleDarkMode: (isDark: boolean) => void
}

import { useMapboxMap } from './use-mapbox-map'
import type { MapHookOptions, MapHookReturn } from '@/types/map'

/**
 * 统一的地图 Hook
 * 支持在 Leaflet 和 Mapbox 之间切换
 */
export function useMap(options: MapHookOptions): MapHookReturn {
  return useMapboxMap(options)
}

/**
 * 专门用于 Mapbox 的 Hook
 * @param options 地图配置选项
 */
export function useMapboxMapDirectly(options: Omit<MapHookOptions, 'provider'>): MapHookReturn {
  return useMapboxMap({ ...options, provider: 'mapbox' })
}

// 导出类型以供使用
export type {
  MapProvider,
  MapHookOptions,
  MapHookReturn,
  MapLocation,
  MapPosition,
  MapMarker,
  MapConfig,
  MapControls,
  MapEventHandlers,
  MapInstance
} from '@/types/map'

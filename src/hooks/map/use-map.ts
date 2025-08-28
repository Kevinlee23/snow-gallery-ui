import { computed } from 'vue'
import { useLeafletMap } from './use-leaflet-map'
import { useMapboxMap } from './use-mapbox-map'
import type { MapHookOptions, MapHookReturn, MapProvider } from '@/types/map'

/**
 * 统一的地图 Hook
 * 支持在 Leaflet 和 Mapbox 之间切换
 */
export function useMap(options: MapHookOptions): MapHookReturn {
  // 默认使用 Leaflet，可以通过环境变量或配置切换
  const defaultProvider: MapProvider = (import.meta.env.VITE_MAP_PROVIDER as MapProvider) || 'leaflet'
  const provider = options.provider || defaultProvider

  // 根据提供商选择对应的实现
  const mapHook = computed(() => {
    switch (provider) {
      case 'mapbox':
        return useMapboxMap(options)
      case 'leaflet':
      default:
        return useLeafletMap(options)
    }
  })

  return mapHook.value
}

/**
 * 专门用于 Leaflet 的 Hook
 * @param options 地图配置选项
 */
export function useLeafletMapDirectly(options: Omit<MapHookOptions, 'provider'>): MapHookReturn {
  return useLeafletMap({ ...options, provider: 'leaflet' })
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

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

/**
 * 获取可用的地图提供商列表
 */
export function getAvailableProviders(): MapProvider[] {
  const providers: MapProvider[] = ['leaflet']
  
  // 检查 Mapbox 是否可用（有 Access Token）
  if (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
    providers.push('mapbox')
  }
  
  return providers
}

/**
 * 检查指定的地图提供商是否可用
 */
export function isProviderAvailable(provider: MapProvider): boolean {
  switch (provider) {
    case 'leaflet':
      return true
    case 'mapbox':
      return !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    default:
      return false
  }
}

/**
 * 获取地图提供商的显示名称
 */
export function getProviderDisplayName(provider: MapProvider): string {
  switch (provider) {
    case 'leaflet':
      return 'OpenStreetMap (Leaflet)'
    case 'mapbox':
      return 'Mapbox GL JS'
    default:
      return 'Unknown'
  }
}

/**
 * 获取地图提供商的特性对比
 */
export function getProviderFeatures(provider: MapProvider) {
  const features = {
    leaflet: {
      performance: '中等',
      style: '基础',
      cost: '免费',
      offline: '支持',
      customization: '中等',
      mobile: '良好',
      vector: '否',
      webgl: '否'
    },
    mapbox: {
      performance: '高',
      style: '丰富',
      cost: '有限免费',
      offline: '部分支持',
      customization: '强大',
      mobile: '优秀',
      vector: '是',
      webgl: '是'
    }
  }
  
  return features[provider] || {}
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

# 地图 Hook 系统

这个地图 Hook 系统支持在 Leaflet 和 Mapbox GL JS 之间无缝切换，提供统一的 API 接口。

## 📁 文件结构

```
src/hooks/
├── use-map.ts              # 统一的地图接口
├── use-leaflet-map.ts      # Leaflet 实现
├── use-mapbox-map.ts       # Mapbox GL JS 实现
└── README.md               # 文档（本文件）

src/types/
└── map.ts                  # 地图相关类型定义
```

## 🚀 快速开始

### 基础使用

```typescript
import { useMap } from '@/hooks/use-map'

// 在组件中使用
const {
  mapInstance,
  isMapReady,
  currentLocation,
  isLocating,
  markers,
  initMap,
  destroyMap,
  addLocationMarkers,
  clearAllMarkers,
  flyToLocation,
  startLocationTracking,
  stopLocationTracking,
  toggleDarkMode
} = useMap({
  config: {
    containerId: 'map',
    center: { lat: 33.54, lng: 110.43 },
    zoom: 4,
    isDarkMode: false
  },
  controls: {
    showZoomControl: true,
    showLocateControl: true,
    showZoomLevelDisplay: true
  },
  handlers: {
    onLocationFound: (event) => {
      console.log('位置找到:', event)
    },
    onLocationError: (error) => {
      console.error('位置错误:', error)
    },
    onZoomEnd: (zoom) => {
      console.log('缩放变化:', zoom)
    }
  }
})

// 初始化地图
onMounted(async () => {
  await initMap()
})

// 清理资源
onBeforeUnmount(() => {
  destroyMap()
})
```

### 指定特定的地图提供商

```typescript
import { useLeafletMapDirectly, useMapboxMapDirectly } from '@/hooks/use-map'

// 强制使用 Leaflet
const leafletMap = useLeafletMapDirectly({ config, controls, handlers })

// 强制使用 Mapbox
const mapboxMap = useMapboxMapDirectly({ config, controls, handlers })
```

## ⚙️ 配置选项

### 环境变量配置

创建 `.env` 文件或在环境中设置以下变量：

```bash
# 地图提供商选择：'leaflet' 或 'mapbox'
VITE_MAP_PROVIDER=leaflet

# Mapbox 配置（仅在使用 Mapbox 时需要）
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# 默认地图配置
VITE_MAP_DEFAULT_CENTER_LAT=33.54
VITE_MAP_DEFAULT_CENTER_LNG=110.43
VITE_MAP_DEFAULT_ZOOM=4
```

### MapHookOptions 参数

```typescript
interface MapHookOptions {
  provider?: 'leaflet' | 'mapbox'  // 可选，默认从环境变量读取
  config: {
    containerId: string             // 地图容器ID
    center: { lat: number; lng: number }  // 地图中心点
    zoom: number                    // 初始缩放级别
    isDarkMode?: boolean            // 是否暗色模式
  }
  controls?: {
    showZoomControl?: boolean       // 是否显示缩放控件
    showLocateControl?: boolean     // 是否显示定位控件
    showZoomLevelDisplay?: boolean  // 是否显示缩放级别
    zoomControlPosition?: 'topright' | 'topleft' | 'bottomright' | 'bottomleft'
  }
  handlers?: {
    onLocationFound?: (event: LocationUpdateEvent) => void
    onLocationError?: (error: { code: number; message: string }) => void
    onZoomEnd?: (zoom: number) => void
    onMarkerClick?: (marker: MapMarker) => void
  }
  locations?: MapLocation[]         // 初始位置数据
  autoFitBounds?: boolean          // 是否自动适应边界
}
```

## 🔄 地图提供商切换

### 检查可用性

```typescript
import { getAvailableProviders, isProviderAvailable } from '@/hooks/use-map'

// 获取所有可用的提供商
const providers = getAvailableProviders()  // ['leaflet'] 或 ['leaflet', 'mapbox']

// 检查特定提供商是否可用
const canUseMapbox = isProviderAvailable('mapbox')  // 检查是否有 Access Token
```

### 动态切换

```typescript
// 方法1：通过环境变量切换
// 设置 VITE_MAP_PROVIDER=mapbox 然后重新构建应用

// 方法2：在代码中指定
const { mapInstance } = useMap({
  provider: 'mapbox',  // 强制使用 Mapbox
  config: { /* ... */ }
})
```

## 📊 功能对比

| 功能 | Leaflet | Mapbox GL JS | 说明 |
|------|---------|--------------|------|
| 基础地图显示 | ✅ | ✅ | 两者都支持 |
| 自定义标记 | ✅ | ✅ | 图标样式略有不同 |
| 用户定位 | ✅ | ✅ | API 一致 |
| 暗色模式 | ⚠️ | ✅ | Leaflet 需自定义样式 |
| 矢量瓦片 | ❌ | ✅ | Mapbox 支持更清晰的缩放 |
| 离线使用 | ✅ | ⚠️ | Leaflet 更好的离线支持 |
| 性能 | 良好 | 优秀 | Mapbox 使用 WebGL 渲染 |
| 成本 | 免费 | 有限免费 | Mapbox 有使用配额 |

## 🛠️ API 参考

### 返回值

```typescript
interface MapHookReturn {
  // 状态
  mapInstance: Ref<MapInstance | null>    // 地图实例
  isMapReady: Ref<boolean>                // 地图是否就绪
  currentLocation: Ref<MapPosition | null> // 当前用户位置
  isLocating: Ref<boolean>                // 是否正在定位
  markers: Ref<MapMarker[]>               // 当前标记列表
  
  // 方法
  initMap: () => Promise<void>            // 初始化地图
  destroyMap: () => void                  // 销毁地图
  addLocationMarkers: (locations: MapLocation[]) => void  // 添加位置标记
  clearAllMarkers: () => void             // 清除所有标记
  flyToLocation: (location: MapPosition, zoom?: number) => void  // 飞行到位置
  startLocationTracking: () => void       // 开始位置跟踪
  stopLocationTracking: () => void        // 停止位置跟踪
  toggleDarkMode: (isDark: boolean) => void  // 切换暗色模式
}
```

### 地图实例方法

```typescript
interface MapInstance {
  // 基础操作
  setView(center: MapPosition, zoom: number): void
  getCenter(): MapPosition
  getZoom(): number
  flyTo(center: MapPosition, zoom?: number): void
  
  // 标记管理
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
  
  // 获取原始地图实例（用于高级操作）
  getNativeMap(): any  // L.Map 或 mapboxgl.Map
}
```

## 🔧 故障排除

### Mapbox 相关问题

1. **地图无法加载**
   - 检查 `VITE_MAPBOX_ACCESS_TOKEN` 是否正确设置
   - 确认 Access Token 是否有效且未过期

2. **样式加载失败**
   - 检查网络连接
   - 确认使用的样式 URL 是否正确

3. **配额超限**
   - 登录 Mapbox 账户检查使用情况
   - 考虑切换回 Leaflet 或升级 Mapbox 套餐

### Leaflet 相关问题

1. **图标不显示**
   - 检查图标文件路径是否正确
   - 确认图标文件是否存在

2. **定位功能异常**
   - 检查浏览器是否支持地理位置 API
   - 确认用户已授权位置访问

### 通用问题

1. **地图容器为空**
   - 确认容器元素已挂载到 DOM
   - 检查容器是否有正确的尺寸

2. **样式冲突**
   - 检查 CSS 样式是否正确引入
   - 确认没有全局样式覆盖地图样式

## 📝 迁移指南

### 从原始 Leaflet 代码迁移

1. **移除直接的 Leaflet 导入**
   ```typescript
   // 删除这些
   import L from 'leaflet'
   import { LocateControl } from 'leaflet.locatecontrol'
   ```

2. **使用新的 Hook**
   ```typescript
   // 替换为
   import { useMap } from '@/hooks/use-map'
   ```

3. **重构地图初始化逻辑**
   - 将地图配置移到 `useMap` 的 options 中
   - 使用返回的方法来操作地图

4. **更新事件处理**
   - 将事件监听器移到 `handlers` 配置中
   - 使用统一的事件格式

## 🌟 最佳实践

1. **性能优化**
   - 在组件卸载时调用 `destroyMap()`
   - 避免频繁的标记添加/删除操作
   - 使用 `autoFitBounds` 自动调整视图

2. **错误处理**
   - 始终包装 `initMap()` 在 try-catch 中
   - 提供降级方案（Leaflet 作为 Mapbox 的后备）

3. **用户体验**
   - 显示地图加载状态
   - 提供位置权限说明
   - 支持暗色模式切换

4. **开发体验**
   - 使用 TypeScript 类型提示
   - 配置环境变量管理不同环境
   - 使用统一的 API 接口便于切换

## 🔮 未来计划

- [ ] 支持更多地图提供商（Google Maps、高德地图等）
- [ ] 添加地图样式编辑器
- [ ] 支持离线地图缓存
- [ ] 添加更多地图控件
- [ ] 性能监控和分析工具

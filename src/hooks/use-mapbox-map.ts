import { ref } from 'vue'
import { toast } from 'vue-sonner'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { 
  MapInstance, 
  MapHookReturn, 
  MapHookOptions, 
  MapLocation, 
  MapPosition, 
  MapMarker 
} from '@/types/map'

// Mapbox 地图实例的实现
class MapboxMapInstance implements MapInstance {
  private map: mapboxgl.Map
  private markers: Map<string, mapboxgl.Marker> = new Map()
  private geolocateControl: mapboxgl.GeolocateControl | null = null

  constructor(map: mapboxgl.Map) {
    this.map = map
  }

  setView(center: MapPosition, zoom: number): void {
    this.map.setCenter([center.lng, center.lat])
    this.map.setZoom(zoom)
  }

  getCenter(): MapPosition {
    const center = this.map.getCenter()
    return { lat: center.lat, lng: center.lng }
  }

  getZoom(): number {
    return this.map.getZoom()
  }

  flyTo(center: MapPosition, zoom?: number): void {
    this.map.flyTo({
      center: [center.lng, center.lat],
      zoom: zoom || this.map.getZoom(),
      essential: true
    })
  }

  addMarker(marker: MapMarker): void {
    // 创建自定义标记元素
    const el = document.createElement('div')
    el.className = 'mapbox-marker'
    el.style.backgroundImage = 'url(/src/assets/flag_flat.png)'
    el.style.width = '24px'
    el.style.height = '24px'
    el.style.backgroundSize = '100%'
    el.style.cursor = 'pointer'
    el.title = marker.title

    // 创建弹窗
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(marker.content)

    // 创建标记
    const mapboxMarker = new mapboxgl.Marker(el)
      .setLngLat([marker.position.lng, marker.position.lat])
      .setPopup(popup)
      .addTo(this.map)

    this.markers.set(marker.id, mapboxMarker)
  }

  removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId)
    if (marker) {
      marker.remove()
      this.markers.delete(markerId)
    }
  }

  clearMarkers(): void {
    this.markers.forEach(marker => {
      marker.remove()
    })
    this.markers.clear()
  }

  updateMarkerContent(markerId: string, content: string): void {
    const marker = this.markers.get(markerId)
    if (marker) {
      const popup = marker.getPopup()
      if (popup) {
        popup.setHTML(content)
      }
    }
  }

  async getCurrentLocation(): Promise<MapPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      )
    })
  }

  enableLocationTracking(): void {
    if (this.geolocateControl) {
      this.geolocateControl.trigger()
    }
  }

  disableLocationTracking(): void {
    // Mapbox GeolocateControl 没有直接的停止方法
    // 可以通过移除控件来实现
  }

  setDarkMode(isDark: boolean): void {
    const lightStyle = 'mapbox://styles/mapbox/streets-v12'
    const darkStyle = 'mapbox://styles/mapbox/dark-v11'
    this.map.setStyle(isDark ? darkStyle : lightStyle)
  }

  destroy(): void {
    this.clearMarkers()
    this.map.remove()
  }

  getNativeMap(): mapboxgl.Map {
    return this.map
  }

  // Mapbox 特定方法
  updateMarkersWithDistance(currentLocation: MapPosition): void {
    this.markers.forEach((marker) => {
      const markerLngLat = marker.getLngLat()
      
      // 计算距离（使用简单的球面距离公式）
      const distance = this.calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        markerLngLat.lat,
        markerLngLat.lng
      )
      
      const popup = marker.getPopup()
      if (popup) {
        const originalContent = popup.getElement()?.querySelector('.popup-original-content')?.innerHTML
        if (originalContent) {
          popup.setHTML(`${originalContent}<br>距离当前位置: ${(distance / 1000).toFixed(0)}km`)
        }
      }
    })
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3 // 地球半径（米）
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // 距离（米）
  }
}

export function useMapboxMap(options: MapHookOptions): MapHookReturn {
  const mapInstance = ref<MapInstance | null>(null)
  const isMapReady = ref(false)
  const currentLocation = ref<MapPosition | null>(null)
  const isLocating = ref(false)
  const markers = ref<MapMarker[]>([])

  // 内部状态
  let map: mapboxgl.Map | null = null
  let geolocateControl: mapboxgl.GeolocateControl | null = null
  let locationUpdateCount = 0
  let lastLocationUpdate = 0

  // 位置格式转换函数：Leaflet 格式 -> Mapbox 格式
  const convertPositionFormat = (position?: 'topright' | 'topleft' | 'bottomright' | 'bottomleft'): mapboxgl.ControlPosition => {
    const positionMap: Record<string, mapboxgl.ControlPosition> = {
      'topright': 'top-right',
      'topleft': 'top-left',
      'bottomright': 'bottom-right',
      'bottomleft': 'bottom-left'
    }
    return positionMap[position || 'topright'] || 'top-right'
  }

  // 检查 Mapbox Access Token
  const checkAccessToken = (): boolean => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    if (!token) {
      console.error('Mapbox Access Token 未设置！请在环境变量中设置 VITE_MAPBOX_ACCESS_TOKEN')
      toast.error('地图配置错误：缺少 Access Token')
      return false
    }
    mapboxgl.accessToken = token
    return true
  }

  // 位置获取成功回调
  const onLocationFound = (position: GeolocationPosition) => {
    const { latitude: lat, longitude: lng } = position.coords
    locationUpdateCount++

    // 防抖机制
    const now = Date.now()
    const shouldExecuteCallback = now - lastLocationUpdate > 500

    // 位置变化阈值检查
    const hasSignificantChange =
      !currentLocation.value ||
      Math.abs(currentLocation.value.lat - lat) > 0.0005 ||
      Math.abs(currentLocation.value.lng - lng) > 0.0005

    currentLocation.value = { lat, lng }
    isLocating.value = false

    if (locationUpdateCount === 1 || hasSignificantChange) {
      toast.success(`成功获取位置: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }

    if (shouldExecuteCallback && hasSignificantChange) {
      lastLocationUpdate = now
      handleLocationUpdate(lat, lng)
    }

    if (options.handlers?.onLocationFound) {
      options.handlers.onLocationFound({ lat, lng })
    }
  }

  // 位置获取失败回调
  const onLocationError = (error: GeolocationPositionError) => {
    console.error('位置获取失败：', error.message)
    isLocating.value = false

    let errorMessage = '位置获取失败'
    switch (error.code) {
      case 1:
        errorMessage = '用户拒绝了位置访问请求'
        break
      case 2:
        errorMessage = '位置信息不可用'
        break
      case 3:
        errorMessage = '位置获取超时'
        break
      default:
        errorMessage = error.message || '未知错误'
    }

    toast.error(`位置获取失败: ${errorMessage}`)
    currentLocation.value = null

    if (options.handlers?.onLocationError) {
      options.handlers.onLocationError({ code: error.code, message: errorMessage })
    }
  }

  // 处理位置更新
  const handleLocationUpdate = (lat: number, lng: number) => {
    if (mapInstance.value instanceof MapboxMapInstance) {
      mapInstance.value.updateMarkersWithDistance({ lat, lng })
    }
  }

  // 重置位置状态
  const resetLocationState = () => {
    locationUpdateCount = 0
    lastLocationUpdate = 0
    console.log('位置更新状态已重置')
  }

  // 初始化地图
  const initMap = async (): Promise<void> => {
    try {
      // 检查 Access Token
      if (!checkAccessToken()) {
        throw new Error('Mapbox Access Token 未设置')
      }

      // 初始化地图
      map = new mapboxgl.Map({
        container: options.config.containerId,
        style: options.config.isDarkMode 
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/streets-v12',
        center: [options.config.center.lng, options.config.center.lat],
        zoom: options.config.zoom
      })

      // 等待地图加载完成
      await new Promise<void>((resolve) => {
        map!.on('load', () => resolve())
      })

      // 添加导航控件（缩放、旋转）
      if (options.controls?.showZoomControl !== false) {
        const nav = new mapboxgl.NavigationControl()
        map.addControl(nav, convertPositionFormat(options.controls?.zoomControlPosition))
      }

      // 添加定位控件
      if (options.controls?.showLocateControl !== false) {
        geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000
          },
          trackUserLocation: false,
          showUserHeading: true,
          showAccuracyCircle: true
        })

        map.addControl(geolocateControl, convertPositionFormat(options.controls?.zoomControlPosition))

        // 监听定位事件
        geolocateControl.on('geolocate', (e: any) => {
          onLocationFound({
            coords: {
              latitude: e.coords.latitude,
              longitude: e.coords.longitude,
              accuracy: e.coords.accuracy,
              altitude: e.coords.altitude,
              altitudeAccuracy: e.coords.altitudeAccuracy,
              heading: e.coords.heading,
              speed: e.coords.speed
            },
            timestamp: e.timestamp
          } as GeolocationPosition)
        })

        geolocateControl.on('error', onLocationError)
      }

      // 添加缩放级别显示控件
      if (options.controls?.showZoomLevelDisplay !== false) {
        const zoomDisplay = document.createElement('div')
        zoomDisplay.className = 'mapboxgl-ctrl mapboxgl-ctrl-group zoom-level-display'
        zoomDisplay.style.backgroundColor = options.config.isDarkMode 
          ? 'rgba(0, 0, 0, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)'
        zoomDisplay.style.padding = '5px 10px'
        zoomDisplay.style.borderRadius = '3px'
        zoomDisplay.style.fontSize = '14px'
        zoomDisplay.style.fontWeight = 'bold'
        zoomDisplay.style.pointerEvents = 'none'
        zoomDisplay.innerHTML = `缩放级别: ${Math.round(map.getZoom())}`

        // 添加到地图容器
        const mapContainer = map.getContainer()
        const controlContainer = mapContainer.querySelector('.mapboxgl-control-container')
        const bottomLeft = controlContainer?.querySelector('.mapboxgl-ctrl-bottom-left')
        if (bottomLeft) {
          bottomLeft.appendChild(zoomDisplay)
        }

        // 监听缩放事件
        map.on('zoom', () => {
          zoomDisplay.innerHTML = `缩放级别: ${Math.round(map!.getZoom())}`
          if (options.handlers?.onZoomEnd) {
            options.handlers.onZoomEnd(map!.getZoom())
          }
        })
      }

      // 创建地图实例包装器
      const mapboxInstance = new MapboxMapInstance(map)
      mapInstance.value = mapboxInstance

      // 添加位置标记
      if (options.locations) {
        addLocationMarkers(options.locations)
      }

      isMapReady.value = true
    } catch (error) {
      console.error('Mapbox 地图初始化失败:', error)
      throw error
    }
  }

  // 销毁地图
  const destroyMap = (): void => {
    if (mapInstance.value) {
      mapInstance.value.destroy()
      mapInstance.value = null
    }

    map = null
    geolocateControl = null
    isMapReady.value = false
    resetLocationState()
  }

  // 添加位置标记
  const addLocationMarkers = (locations: MapLocation[]): void => {
    if (!mapInstance.value) return

    clearAllMarkers()

    const newMarkers: MapMarker[] = locations.map(location => {
      if (location.coordinate && location.coordinate.length === 2) {
        const marker: MapMarker = {
          id: location._id,
          position: { lat: location.coordinate[0], lng: location.coordinate[1] },
          title: location.fullName,
          content: `<div class="popup-original-content">${location.fullName}<br>${location.photoCount} PHOTOS</div>`,
          location
        }

        mapInstance.value!.addMarker(marker)
        return marker
      }
      return null
    }).filter(Boolean) as MapMarker[]

    markers.value = newMarkers

    // 自动适应边界
    if (options.autoFitBounds && newMarkers.length > 0 && map) {
      const bounds = new mapboxgl.LngLatBounds()
      newMarkers.forEach(marker => {
        bounds.extend([marker.position.lng, marker.position.lat])
      })
      map.fitBounds(bounds, { padding: 50 })
    }
  }

  // 清除所有标记
  const clearAllMarkers = (): void => {
    if (mapInstance.value) {
      mapInstance.value.clearMarkers()
    }
    markers.value = []
  }

  // 飞行到指定位置
  const flyToLocation = (location: MapPosition, zoom?: number): void => {
    if (mapInstance.value) {
      mapInstance.value.flyTo(location, zoom)
    }
  }

  // 开始位置跟踪
  const startLocationTracking = (): void => {
    if (mapInstance.value) {
      isLocating.value = true
      mapInstance.value.enableLocationTracking()
    }
  }

  // 停止位置跟踪
  const stopLocationTracking = (): void => {
    if (mapInstance.value) {
      mapInstance.value.disableLocationTracking()
      isLocating.value = false
    }
  }

  // 切换暗色模式
  const toggleDarkMode = (isDark: boolean): void => {
    if (mapInstance.value) {
      mapInstance.value.setDarkMode(isDark)
    }
  }

  return {
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
  }
}

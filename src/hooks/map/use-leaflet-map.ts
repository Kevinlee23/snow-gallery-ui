import { ref } from 'vue'
import { toast } from 'vue-sonner'
import L from 'leaflet'
import { LocateControl } from 'leaflet.locatecontrol'
import 'leaflet.locatecontrol'
import type { MapInstance, MapHookReturn, MapHookOptions, MapLocation, MapPosition, MapMarker } from '@/types/map'
import flagIcon from '@/assets/flag_flat.png'

// Leaflet 地图实例的实现
class LeafletMapInstance implements MapInstance {
  private map: L.Map
  private markers: Map<string, L.Marker> = new Map()
  private locateControl: LocateControl | null = null

  constructor(map: L.Map) {
    this.map = map
  }

  setView(center: MapPosition, zoom: number): void {
    this.map.setView([center.lat, center.lng], zoom)
  }

  getCenter(): MapPosition {
    const center = this.map.getCenter()
    return { lat: center.lat, lng: center.lng }
  }

  getZoom(): number {
    return this.map.getZoom()
  }

  flyTo(center: MapPosition, zoom?: number): void {
    this.map.flyTo([center.lat, center.lng], zoom)
  }

  addMarker(marker: MapMarker): void {
    const myIcon = L.icon({
      iconUrl: flagIcon,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    })

    const leafletMarker = L.marker([marker.position.lat, marker.position.lng], { title: marker.title, icon: myIcon })
      .addTo(this.map)
      .bindPopup(marker.content)

    this.markers.set(marker.id, leafletMarker)
  }

  removeMarker(markerId: string): void {
    const marker = this.markers.get(markerId)
    if (marker) {
      this.map.removeLayer(marker)
      this.markers.delete(markerId)
    }
  }

  clearMarkers(): void {
    this.markers.forEach((marker) => {
      this.map.removeLayer(marker)
    })
    this.markers.clear()
  }

  updateMarkerContent(markerId: string, content: string): void {
    const marker = this.markers.get(markerId)
    if (marker) {
      marker.bindPopup(content)
    }
  }

  setDarkMode(isDark: boolean): void {
    // Leaflet 本身不支持内置暗色模式，这里可以通过CSS类来控制
    const container = this.map.getContainer()
    if (isDark) {
      container.classList.add('dark-mode')
    } else {
      container.classList.remove('dark-mode')
    }
  }

  destroy(): void {
    this.clearMarkers()
    if (this.locateControl) {
      this.map.removeControl(this.locateControl)
    }
    this.map.remove()
  }

  getNativeMap(): L.Map {
    return this.map
  }

  // Leaflet 特定方法
  setLocateControl(control: LocateControl): void {
    this.locateControl = control
  }

  updateMarkersWithDistance(currentLocation: MapPosition): void {
    const loc = L.latLng(currentLocation.lat, currentLocation.lng)
    this.markers.forEach((marker) => {
      const markLoc = marker.getLatLng()
      const distance = markLoc.distanceTo(loc)
      const prev = marker.getPopup()?.getContent()
      marker.bindPopup(`${prev}<br>距离当前位置: ${(distance / 1000).toFixed(0)}km`)
    })
  }
}

export function useLeafletMap(options: MapHookOptions): MapHookReturn {
  const mapInstance = ref<MapInstance | null>(null)
  const isMapReady = ref(false)
  const currentLocation = ref<MapPosition | null>(null)
  const isLocating = ref(false)
  const markers = ref<MapMarker[]>([])

  // 内部状态
  let map: L.Map | null = null
  let locateControl: LocateControl | null = null
  let locationUpdateCount = 0
  let lastLocationUpdate = 0

  // 位置获取成功回调函数
  const onLocationFound = (event: L.LocationEvent) => {
    const { lat, lng } = event.latlng
    locationUpdateCount++

    // 防抖机制：限制回调执行频率（500ms内只执行一次）
    const now = Date.now()
    const shouldExecuteCallback = now - lastLocationUpdate > 500

    // 位置变化阈值：只有当位置变化超过50米时才执行回调
    const hasSignificantChange =
      !currentLocation.value ||
      Math.abs(currentLocation.value.lat - lat) > 0.0005 || // 约50米
      Math.abs(currentLocation.value.lng - lng) > 0.0005

    // 更新当前位置
    currentLocation.value = { lat, lng }
    isLocating.value = false

    // 只在第一次或位置有显著变化时显示提示
    if (locationUpdateCount === 1 || hasSignificantChange) {
      toast.success(`成功获取位置: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }

    // 执行自定义业务逻辑（添加防抖和阈值判断）
    if (shouldExecuteCallback && hasSignificantChange) {
      lastLocationUpdate = now
      handleLocationUpdate(lat, lng)
    }

    // 调用用户自定义回调
    if (options.handlers?.onLocationFound) {
      options.handlers.onLocationFound({ lat, lng })
    }
  }

  // 位置获取失败回调函数
  const onLocationError = (event: L.ErrorEvent) => {
    console.error('位置获取失败：', event.message)
    isLocating.value = false

    // 根据错误类型提供更友好的错误信息
    let errorMessage = '位置获取失败'
    switch (event.code) {
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
        errorMessage = event.message || '未知错误'
    }

    toast.error(`位置获取失败: ${errorMessage}`)
    currentLocation.value = null

    // 调用用户自定义回调
    if (options.handlers?.onLocationError) {
      options.handlers.onLocationError({ code: event.code, message: errorMessage })
    }
  }

  // 处理位置更新的业务逻辑
  const handleLocationUpdate = (lat: number, lng: number) => {
    if (mapInstance.value instanceof LeafletMapInstance) {
      mapInstance.value.updateMarkersWithDistance({ lat, lng })
    }
  }

  // 监听缩放事件
  const onZoomEnd = () => {
    if (map && options.handlers?.onZoomEnd) {
      options.handlers.onZoomEnd(map.getZoom())
    }

    // 更新缩放级别显示
    if (options.controls?.showZoomLevelDisplay) {
      const zoomDisplay = document.querySelector('.zoom-level-display')
      if (zoomDisplay) {
        zoomDisplay.innerHTML = `缩放级别: ${map?.getZoom()}`
      }
    }
  }

  // 重置位置更新状态
  const resetLocationState = () => {
    locationUpdateCount = 0
    lastLocationUpdate = 0
    console.log('位置更新状态已重置')
  }

  // 初始化地图
  const initMap = async (): Promise<void> => {
    try {
      // 初始化地图
      map = L.map(options.config.containerId).setView([options.config.center.lat, options.config.center.lng], options.config.zoom)

      // 设置缩放控制位置
      if (options.controls?.showZoomControl !== false) {
        map.zoomControl.setPosition(options.controls?.zoomControlPosition || 'topright')
      }

      // 添加位置事件监听器
      map.on('locationfound', onLocationFound)
      map.on('locationerror', onLocationError)
      map.on('zoomend', onZoomEnd)

      // 添加定位控件
      if (options.controls?.showLocateControl !== false) {
        locateControl = new LocateControl({
          position: options.controls?.zoomControlPosition || 'topright',
          flyTo: true,
          initialZoomLevel: options.config.zoom,
          drawCircle: true,
          drawMarker: true,
          showPopup: false,
          strings: {
            title: '获取我的位置'
          },
          locateOptions: {
            enableHighAccuracy: true,
            watch: false, // 关闭持续监听，只获取一次位置
            maximumAge: 30000,
            timeout: 15000
          }
        }).addTo(map)
      }

      // 添加 OpenStreetMap 瓦片图层
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map)

      // 添加缩放级别显示控件
      if (options.controls?.showZoomLevelDisplay !== false) {
        const zoomLevelControl = new L.Control({ position: 'bottomleft' })
        zoomLevelControl.onAdd = function (map: L.Map) {
          const div = L.DomUtil.create('div', 'zoom-level-display')
          div.style.backgroundColor = options.config.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'
          div.style.padding = '5px 10px'
          div.style.borderRadius = '3px'
          div.style.fontSize = '14px'
          div.style.fontWeight = 'bold'
          div.innerHTML = `缩放级别: ${map.getZoom()}`
          return div
        }
        zoomLevelControl.addTo(map)
      }

      // 创建地图实例包装器
      const leafletInstance = new LeafletMapInstance(map)
      if (locateControl) {
        leafletInstance.setLocateControl(locateControl)
      }
      mapInstance.value = leafletInstance

      // 添加位置标记
      if (options.locations) {
        addLocationMarkers(options.locations)
      }

      isMapReady.value = true
    } catch (error) {
      console.error('地图初始化失败:', error)
      throw error
    }
  }

  // 销毁地图
  const destroyMap = (): void => {
    if (map) {
      map.off('locationfound', onLocationFound)
      map.off('locationerror', onLocationError)
      map.off('zoomend', onZoomEnd)
    }

    if (mapInstance.value) {
      mapInstance.value.destroy()
      mapInstance.value = null
    }

    map = null
    locateControl = null
    isMapReady.value = false
    resetLocationState()
  }

  // 添加位置标记
  const addLocationMarkers = (locations: MapLocation[]): void => {
    if (!mapInstance.value) return

    clearAllMarkers()

    const newMarkers: MapMarker[] = locations
      .map((location) => {
        if (location.coordinate && location.coordinate.length === 2) {
          const marker: MapMarker = {
            id: location._id,
            position: { lat: location.coordinate[0], lng: location.coordinate[1] },
            title: location.fullName,
            content: `${location.fullName}<br>${location.photoCount} PHOTOS`,
            location
          }

          mapInstance.value!.addMarker(marker)
          return marker
        }
        return null
      })
      .filter(Boolean) as MapMarker[]

    markers.value = newMarkers

    // 自动适应边界
    if (options.autoFitBounds && newMarkers.length > 0 && map && mapInstance.value) {
      const group = new L.FeatureGroup()
      const instance = mapInstance.value as LeafletMapInstance
      newMarkers.forEach((marker) => {
        instance.getNativeMap().eachLayer((layer: L.Layer) => {
          if (layer instanceof L.Marker && layer.options.title === marker.title) {
            group.addLayer(layer)
          }
        })
      })
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds(), { padding: [20, 20] })
      }
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
    toggleDarkMode
  }
}

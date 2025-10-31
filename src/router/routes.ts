import type { RouteRecordRaw } from 'vue-router'
import Locations from '@/views/locations.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home.vue'),
    meta: {
      title: '首页',
      description: '这是首页'
    }
  },
  {
    path: '/photos',
    name: 'photos-ui',
    component: () => import('@/views/photos-ui.vue'),
    meta: {
      title: '[UI] photos-ui',
      description: '相片列表页'
    }
  },
  {
    path: '/p/:id',
    name: 'photo-item',
    component: () => import('@/views/p.vue'),
    meta: {
      title: '[UI] photo-item',
      description: '相片详情页'
    }
  },
  {
    path: '/fav-gallery',
    name: 'fav-gallery',
    component: () => import('@/views/fav-gallery.vue'),
    meta: {
      title: '[UI] fav-gallery',
      description: '珍藏相簿'
    }
  },
  {
    path: '/gallerys',
    name: 'gallerys',
    component: () => import('@/views/gallerys.vue'),
    meta: {
      title: '[UI] gallerys',
      description: '相簿列表页'
    }
  },
  {
    path: '/device',
    name: 'device',
    component: () => import('@/views/device.vue'),
    meta: {
      title: '[UI] device',
      description: '设备管理'
    }
  },
  {
    path: '/locations',
    name: 'locations',
    component: Locations,
    meta: {
      title: '[UI] locations',
      description: '拍摄地点列表'
    }
  },
  {
    path: '/year/:id',
    name: 'year',
    component: () => import('@/views/filter/year.vue'),
    meta: {
      title: '[UI] year',
      description: '年份相簿'
    }
  },
  {
    path: '/album/:id',
    name: 'album',
    component: () => import('@/views/filter/album.vue'),
    meta: {
      title: '[UI] album',
      description: '相簿相片列表'
    }
  },
  {
    path: '/camera/:id',
    name: 'camera',
    component: () => import('@/views/filter/camera.vue'),
    meta: {
      title: '[UI] camera',
      description: '相机相片列表'
    }
  },
  {
    path: '/lenses/:id',
    name: 'lenses',
    component: () => import('@/views/filter/lenses.vue'),
    meta: {
      title: '[UI] lenses',
      description: '镜头相片列表'
    }
  },
  {
    path: '/location/:id',
    name: 'location',
    component: () => import('@/views/filter/location.vue'),
    meta: {
      title: '[UI] location',
      description: '拍摄地点相片列表'
    }
  }
]

export default routes

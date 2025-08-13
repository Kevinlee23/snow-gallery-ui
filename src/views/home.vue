<template>
  <div class="relative min-h-[100vh]">
    <div class="absolute left-[50%] top-[50%] mx-auto w-[1280px] translate-x-[-50%] translate-y-[-50%]">
      <div class="w-full py-8 text-center text-[20px] font-bold">Snowinlu's Gallery</div>
      <div class="grid grid-cols-4 gap-x-10">
        <router-link to="/photos" class="label-item group">
          <span class="relative">
            前往画廊
            <span class="absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-500 ease-in-out group-hover:w-full"></span>
          </span>
        </router-link>
        <router-link to="/gallerys" class="label-item group relative">
          <span class="relative">
            相簿列表
            <span class="absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-500 ease-in-out group-hover:w-full"></span>
          </span>
          <router-link to="/fav-gallery" class="absolute bottom-4 right-4 flex items-center gap-x-2">
            FAV
            <Film :size="16" class="text-black" />
          </router-link>
        </router-link>
        <router-link to="/locations" class="label-item group">
          <span class="relative">
            前往地点
            <span class="absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-500 ease-in-out group-hover:w-full"></span>
          </span>
        </router-link>
        <router-link to="/device" class="label-item group">
          <span class="relative">
            设备管理
            <span class="absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-500 ease-in-out group-hover:w-full"></span>
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Film } from 'lucide-vue-next'
</script>

<style lang="scss" scoped>
.label-item {
  @apply flex aspect-square h-full w-full items-center justify-center bg-gray-100/50;
}
</style>

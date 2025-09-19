<template>
  <div class="relative min-h-[100vh] dark:bg-black dark:text-gray-400">
    <div class="absolute left-[50%] top-[50%] mx-auto w-full translate-x-[-50%] translate-y-[-50%] px-5 xl:w-[1280px] xl:px-0">
      <div class="w-full py-8 text-center text-[20px] font-bold dark:text-white">Snowinlu's Gallery</div>
      <div class="flex flex-col gap-x-10 gap-y-5 md:grid md:grid-cols-4">
        <div class="label-item">
          <router-link to="/photos" class="label-title group">
            前往画廊
            <span class="item-underline"></span>
          </router-link>
        </div>
        <div class="label-item relative">
          <router-link to="/gallerys" class="label-title group">
            相簿列表
            <span class="item-underline"></span>
          </router-link>
          <router-link
            to="/fav-gallery"
            class="absolute bottom-4 right-4 hidden items-center gap-x-1 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white md:flex"
          >
            FAV
            <Sparkle :size="16" />
          </router-link>
        </div>
        <div class="label-item">
          <router-link to="/locations" class="label-title group">
            前往地点
            <span class="item-underline"></span>
          </router-link>
        </div>
        <div class="label-item">
          <router-link to="/device" class="label-title group">
            设备一览
            <span class="item-underline"></span>
          </router-link>
        </div>
      </div>
    </div>
    <div class="absolute bottom-4 right-4 text-gray-500 dark:text-white">v1.2.0</div>
  </div>
</template>

<script setup lang="ts">
import { Sparkle } from 'lucide-vue-next'
</script>

<style lang="scss" scoped>
.label-item {
  @apply flex aspect-square h-[100px] items-center justify-center rounded-[8px] bg-gray-100/50 dark:bg-gray-500/30 md:h-full md:w-full;

  .label-title {
    @apply relative dark:hover:text-white;
  }
}

.item-underline {
  @apply absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-500 ease-in-out group-hover:w-full;
}
</style>

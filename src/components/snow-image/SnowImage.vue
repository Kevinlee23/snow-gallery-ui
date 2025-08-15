<template>
  <div 
    ref="imageContainer" 
    class="relative overflow-hidden"
    :class="containerClass"
  >
    <!-- 加载占位符 -->
    <div 
      v-if="!imageLoaded && !imageError" 
      class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
    >
      <slot name="loading">
        <div class="flex flex-col items-center gap-2 text-gray-400">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
          <span class="text-sm">{{ loadingText }}</span>
        </div>
      </slot>
    </div>
    
    <!-- 实际图片 -->
    <img 
      v-if="shouldLoadImage"
      :src="src" 
      :alt="alt" 
      :class="imageClass"
      class="transition-opacity duration-300"
      :style="{ opacity: imageLoaded ? 1 : 0 }"
      @load="handleImageLoad"
      @error="handleImageError"
    />
    
    <!-- 加载失败占位符 -->
    <div 
      v-if="imageError" 
      class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
    >
      <slot name="error">
        <div class="flex flex-col items-center gap-2 text-gray-400">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"></path>
          </svg>
          <span class="text-sm">{{ errorText }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

export interface SnowImageProps {
  /** 图片地址 */
  src: string
  /** 图片描述 */
  alt?: string
  /** 容器自定义样式类 */
  containerClass?: string
  /** 图片自定义样式类 */
  imageClass?: string
  /** 加载中文本 */
  loadingText?: string
  /** 错误文本 */
  errorText?: string
  /** Intersection Observer 阈值 */
  threshold?: number
  /** Intersection Observer 根边距 */
  rootMargin?: string
}

const props = withDefaults(defineProps<SnowImageProps>(), {
  alt: '',
  containerClass: '',
  imageClass: 'h-full w-full object-cover',
  loadingText: '加载中...',
  errorText: '加载失败',
  threshold: 0.1,
  rootMargin: '50px'
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

// 懒加载相关状态
const imageContainer = ref<HTMLElement>()
const shouldLoadImage = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

// 图片加载成功处理
const handleImageLoad = (event: Event) => {
  imageLoaded.value = true
  imageError.value = false
  emit('load', event)
}

// 图片加载失败处理
const handleImageError = (event: Event) => {
  imageLoaded.value = false
  imageError.value = true
  emit('error', event)
}

// 使用 Intersection Observer 监听图片容器
useIntersectionObserver(
  imageContainer,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !shouldLoadImage.value) {
      shouldLoadImage.value = true
    }
  },
  {
    threshold: props.threshold,
    rootMargin: props.rootMargin
  }
)

// 暴露状态供父组件使用
defineExpose({
  isLoaded: imageLoaded,
  isError: imageError,
  shouldLoad: shouldLoadImage
})
</script>

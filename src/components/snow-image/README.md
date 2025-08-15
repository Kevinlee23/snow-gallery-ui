# SnowImage 懒加载图片组件

一个功能完整的 Vue 3 懒加载图片组件，支持自定义加载状态和错误处理。

## 特性

- 🚀 **智能懒加载**: 使用 Intersection Observer API
- 🎨 **自定义插槽**: 支持自定义加载和错误状态
- 📱 **响应式设计**: 完全适配移动端和桌面端
- 🌙 **深色模式**: 内置深色模式支持
- ⚡ **性能优化**: 可配置的加载阈值和边距
- 🛠 **类型安全**: 完整的 TypeScript 支持

## 基础用法

```vue
<template>
  <SnowImage 
    src="https://example.com/image.jpg" 
    alt="示例图片"
    container-class="aspect-square"
    image-class="rounded-lg"
  />
</template>

<script setup>
import { SnowImage } from '@/components/snow-image'
</script>
```

## 自定义加载状态

```vue
<template>
  <SnowImage src="https://example.com/image.jpg">
    <template #loading>
      <div class="custom-loading">
        <MySpinner />
        <span>正在加载...</span>
      </div>
    </template>
    
    <template #error>
      <div class="custom-error">
        <ErrorIcon />
        <span>图片加载失败</span>
      </div>
    </template>
  </SnowImage>
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | - | 图片地址（必填） |
| `alt` | `string` | `''` | 图片描述 |
| `containerClass` | `string` | `''` | 容器自定义样式类 |
| `imageClass` | `string` | `'h-full w-full object-cover'` | 图片自定义样式类 |
| `loadingText` | `string` | `'加载中...'` | 加载中文本 |
| `errorText` | `string` | `'加载失败'` | 错误文本 |
| `threshold` | `number` | `0.1` | Intersection Observer 阈值 |
| `rootMargin` | `string` | `'50px'` | Intersection Observer 根边距 |

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `load` | `Event` | 图片加载成功时触发 |
| `error` | `Event` | 图片加载失败时触发 |

## 插槽

| 插槽名 | 说明 |
|--------|------|
| `loading` | 自定义加载状态内容 |
| `error` | 自定义错误状态内容 |

## 暴露的方法/属性

```vue
<script setup>
import { ref } from 'vue'
import { SnowImage } from '@/components/snow-image'

const imageRef = ref()

// 访问状态
console.log(imageRef.value?.isLoaded) // 是否已加载
console.log(imageRef.value?.isError)  // 是否加载错误
console.log(imageRef.value?.shouldLoad) // 是否应该开始加载
</script>

<template>
  <SnowImage ref="imageRef" src="..." />
</template>
```


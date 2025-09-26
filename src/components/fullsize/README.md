## Fullsize（Canvas 图片查看器）

一个基于 `<canvas>` 的图片放大/拖拽查看组件。支持按图片宽高比智能适配、滚轮缩放（围绕光标）、指针拖拽、双指捏合缩放，并针对高 DPI 屏清晰渲染。

参考交互来源：[Innei’s Afilmory - DSCF4939](https://afilmory.innei.in/DSCF4939)

### 特性
- 智能初始适配（smart/contain/cover）
- 高 DPI 清晰渲染（devicePixelRatio）
- 滚轮缩放、指针拖拽、双指捏合
- 事件与方法暴露，便于外部控制
- 支持外层容器类名传入（`container-class`）

### 基本用法
```vue
<script setup lang="ts">
import Fullsize from '@/components/fullsize/index.vue'

const imgUrl = 'https://your-oss/example.jpg'
</script>

<template>
  <div class="h-[80vh] w-full">
    <Fullsize :src="imgUrl" container-class="h-full w-full rounded-md" />
  </div>
</template>
```

### Props
- `src: string` 必填，图片地址（建议开启 OSS CORS）
- `alt?: string` 可选，备用文本
- `containerClass?: string` 外层容器类名（默认 `''`）
- `background?: string` 画布背景色（默认 `#000`）
- `fitStrategy?: 'smart' | 'contain' | 'cover'` 初始适配策略（默认 `smart`）
- `maxZoom?: number` 最大缩放倍数（默认 `8`）
- `zoomStep?: number` 单次缩放步进（默认 `0.15`）
- `disableWheel?: boolean` 禁用滚轮缩放（默认 `false`）
- `disableDrag?: boolean` 禁用拖拽（默认 `false`）
- `disablePinch?: boolean` 禁用双指捏合（默认 `false`）

### Emits
- `load(meta: { width: number; height: number })` 图片加载完成
- `error(err: unknown)` 图片加载失败
- `zoom({ scale, x, y })` 缩放事件（当前倍率与中心点）
- `pan({ offsetX, offsetY })` 平移事件（当前偏移）
- `reset()` 调用 `reset()` 时触发

### 暴露方法（expose）
```ts
// 通过 ref 获取组件实例后可调用
reset(): void
fit(): void
zoomTo(scale: number, center?: { x: number; y: number }): void
zoomIn(step?: number, center?: { x: number; y: number }): void
zoomOut(step?: number, center?: { x: number; y: number }): void
panBy(dx: number, dy: number): void
```

示例：
```vue
<template>
  <Fullsize ref="viewer" :src="imgUrl" />
  <button @click="() => viewer?.zoomIn()">放大</button>
  <button @click="() => viewer?.reset()">还原</button>
  <button @click="() => viewer?.panBy(50, 0)">右移 50px</button>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Fullsize from '@/components/fullsize/index.vue'

const viewer = ref<InstanceType<typeof Fullsize> | null>(null)
const imgUrl = 'https://your-oss/example.jpg'
</script>
```

### 注意事项
- 组件内部对图片设置了 `image.crossOrigin = 'anonymous'`。若未来需要导出图像或像素读写，请确保 OSS 已开启 CORS。
- `ResizeObserver` 会在容器尺寸变化时保持视觉中心稳定。
- `minZoom` 默认取初始适配比例，保证最小视图完整可见。

### TODO（可按需扩展）
- 双击切换“适配/1:1（或 2x）”
- 键盘操作（+- 缩放、方向键平移、0 还原）
- 平移边界约束与阻尼回弹
- 简易控制栏（放大/缩小/还原/下载）



<template>
  <div class="relative overflow-hidden" :class="containerClass">
    <div
      ref="containerRef"
      class="relative h-full w-full overflow-hidden touch-none select-none #f3f4f6"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <canvas ref="canvasRef" class="block h-full w-full"></canvas>
      <div
        v-if="!loaded && !error"
        class="pointer-events-none absolute inset-0 flex items-center justify-center text-white/70"
      >
        加载中...
      </div>
      <div
        v-if="error"
        class="pointer-events-none absolute inset-0 flex items-center justify-center text-red-300"
      >
        加载失败
      </div>
    </div>
  </div>
  
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from 'vue'

type FitStrategy = 'smart' | 'contain' | 'cover'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
  background?: string
  fitStrategy?: FitStrategy
  maxZoom?: number
  zoomStep?: number
  disableWheel?: boolean
  disableDrag?: boolean
  disablePinch?: boolean
  containerClass?: string
}>(), {
  alt: '',
  background: '#f3f4f6',
  fitStrategy: 'smart',
  maxZoom: 8,
  zoomStep: 0.15,
  disableWheel: false,
  disableDrag: false,
  disablePinch: false,
  containerClass: ''
})

const emit = defineEmits<{
  (e: 'load', meta: { width: number; height: number }): void
  (e: 'error', err: unknown): void
  (e: 'zoom', data: { scale: number; x: number; y: number }): void
  (e: 'pan', data: { offsetX: number; offsetY: number }): void
  (e: 'reset'): void
}>()

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null
let dpr = 1

// image & intrinsic size
const img = new Image()
img.crossOrigin = 'anonymous'
let imgW = 0
let imgH = 0

// container size
let cw = 0
let ch = 0

// view state
const loaded = ref(false)
const error = ref(false)
let baseScale = 1 // 初始适配比例
let scale = 1
let offsetX = 0
let offsetY = 0

// pointer state for drag / pinch
const isDragging = ref(false)
let lastX = 0
let lastY = 0
const activePointers = new Map<number, { x: number; y: number }>()
let pinchStartDistance = 0
let pinchStartScale = 1
let pinchCenter: { x: number; y: number } | null = null

const minZoom = computed(() => baseScale)

function setCanvasSize() {
  if (!containerRef.value || !canvasRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  cw = Math.max(1, Math.floor(rect.width))
  ch = Math.max(1, Math.floor(rect.height))
  dpr = Math.max(1, window.devicePixelRatio || 1)
  const canvas = canvasRef.value
  canvas.width = Math.floor(cw * dpr)
  canvas.height = Math.floor(ch * dpr)
  canvas.style.width = cw + 'px'
  canvas.style.height = ch + 'px'
  ctx = canvas.getContext('2d')
}

function computeSmartFit() {
  if (!cw || !ch || !imgW || !imgH) return 1
  const ar = imgW / imgH
  const car = cw / ch
  if (props.fitStrategy === 'contain') {
    return Math.min(cw / imgW, ch / imgH)
  }
  if (props.fitStrategy === 'cover') {
    return Math.max(cw / imgW, ch / imgH)
  }
  // smart
  if (ar > car) {
    return cw / imgW
  } else {
    return ch / imgH
  }
}

function fit() {
  baseScale = computeSmartFit() || 1
  scale = baseScale
  // 让图像居中
  offsetX = (cw - imgW * scale) / 2
  offsetY = (ch - imgH * scale) / 2
  requestRender()
}

function reset() {
  fit()
  emit('reset')
}

function toImageSpace(x: number, y: number) {
  const ix = (x - offsetX) / scale
  const iy = (y - offsetY) / scale
  return { ix, iy }
}

function clampScale(next: number) {
  const min = minZoom.value
  const max = props.maxZoom
  return Math.min(Math.max(next, min), max)
}

function zoomTo(nextScale: number, centerClient?: { x: number; y: number }) {
  const min = minZoom.value
  const max = props.maxZoom
  const target = Math.min(Math.max(nextScale, min), max)
  const cx = centerClient?.x ?? cw / 2
  const cy = centerClient?.y ?? ch / 2
  const { ix, iy } = toImageSpace(cx, cy)
  scale = target
  offsetX = cx - ix * scale
  offsetY = cy - iy * scale
  requestRender()
  emit('zoom', { scale, x: cx, y: cy })
}

function zoomIn(step = props.zoomStep, center?: { x: number; y: number }) {
  zoomTo(scale * (1 + step), center)
}

function zoomOut(step = props.zoomStep, center?: { x: number; y: number }) {
  zoomTo(scale / (1 + step), center)
}

function panBy(dx: number, dy: number) {
  offsetX += dx
  offsetY += dy
  requestRender()
  emit('pan', { offsetX, offsetY })
}

// rendering
let rafId = 0
function render() {
  if (!ctx) return
  // 背景
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = props.background || '#000'
  ctx.fillRect(0, 0, cw * dpr, ch * dpr)
  ctx.restore()

  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.translate(offsetX, offsetY)
  ctx.scale(scale, scale)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, imgW, imgH)
  ctx.restore()
}

function requestRender() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rafId = 0
    render()
  })
}

// events
function onWheel(e: WheelEvent) {
  if (props.disableWheel || !loaded.value) return
  e.preventDefault()
  const rect = containerRef.value!.getBoundingClientRect()
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top
  const delta = e.deltaY
  const factor = delta > 0 ? 1 / (1 + props.zoomStep) : 1 + props.zoomStep
  zoomTo(scale * factor, { x: cx, y: cy })
}

function onPointerDown(e: PointerEvent) {
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (activePointers.size === 1) {
    isDragging.value = !props.disableDrag
    lastX = e.clientX
    lastY = e.clientY
  } else if (activePointers.size === 2 && !props.disablePinch) {
    const pts = [...activePointers.values()]
    pinchStartDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    pinchStartScale = scale
    const rect = containerRef.value!.getBoundingClientRect()
    const cx = (pts[0].x + pts[1].x) / 2 - rect.left
    const cy = (pts[0].y + pts[1].y) / 2 - rect.top
    pinchCenter = { x: cx, y: cy }
  }
}

function onPointerMove(e: PointerEvent) {
  if (!activePointers.has(e.pointerId)) return
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (activePointers.size === 1 && isDragging.value && !props.disableDrag) {
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    panBy(dx, dy)
  }

  if (activePointers.size === 2 && !props.disablePinch) {
    const pts = [...activePointers.values()]
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    if (pinchStartDistance > 0 && pinchCenter) {
      const factor = dist / pinchStartDistance
      const next = clampScale(pinchStartScale * factor)
      zoomTo(next, pinchCenter)
    }
  }
}

function onPointerUp(e: PointerEvent) {
  activePointers.delete(e.pointerId)
  if (activePointers.size <= 0) {
    isDragging.value = false
    pinchStartDistance = 0
    pinchCenter = null
  }
}

// load image
function load(src: string) {
  loaded.value = false
  error.value = false
  img.onload = () => {
    imgW = img.naturalWidth || img.width
    imgH = img.naturalHeight || img.height
    loaded.value = true
    emit('load', { width: imgW, height: imgH })
    nextTick(() => {
      setCanvasSize()
      fit()
    })
  }
  img.onerror = (err) => {
    error.value = true
    emit('error', err)
  }
  img.src = src
}

// resize
let ro: ResizeObserver | null = null
function startResizeObserver() {
  if (!containerRef.value) return
  ro = new ResizeObserver(() => {
    setCanvasSize()
    if (loaded.value) {
      // 维持可视中心稳定：以容器中心为参考重新计算偏移
      const cx = cw / 2
      const cy = ch / 2
      const { ix, iy } = toImageSpace(cx, cy)
      baseScale = computeSmartFit() || baseScale
      scale = Math.max(scale, baseScale)
      offsetX = cx - ix * scale
      offsetY = cy - iy * scale
      requestRender()
    } else {
      requestRender()
    }
  })
  ro.observe(containerRef.value)
}

onMounted(async () => {
  await nextTick()
  setCanvasSize()
  startResizeObserver()
  if (props.src) load(props.src)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})

watch(() => props.src, (nv) => {
  if (nv) load(nv)
})

defineExpose({ reset, fit, zoomTo, zoomIn, zoomOut, panBy })
</script>

<style scoped>
</style>



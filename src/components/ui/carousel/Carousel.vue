<script setup lang="ts">
import { cn } from '@/lib/utils'
import { useProvideCarousel } from './useCarousel'

type LocalCarouselProps = { opts?: any; plugins?: any; orientation?: 'horizontal' | 'vertical'; class?: any }
const props = withDefaults(defineProps<LocalCarouselProps>(), { orientation: 'horizontal' })

type LocalCarouselEmits = { (e: 'init-api', payload: any): void }
const emits = defineEmits<LocalCarouselEmits>()

const ctx = useProvideCarousel(props as any, emits as any) as any
const { canScrollNext, canScrollPrev, carouselApi, carouselRef, orientation, scrollNext, scrollPrev } = ctx

defineExpose({
  canScrollNext,
  canScrollPrev,
  carouselApi,
  carouselRef,
  orientation,
  scrollNext,
  scrollPrev,
})

function onKeyDown(event: KeyboardEvent) {
  const prevKey = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  const nextKey = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'

  if (event.key === prevKey) {
    event.preventDefault()
    scrollPrev()

    return
  }

  if (event.key === nextKey) {
    event.preventDefault()
    scrollNext()
  }
}
</script>

<template>
  <div
    :class="cn('relative', props.class)"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <slot :can-scroll-next :can-scroll-prev :carousel-api :carousel-ref :orientation :scroll-next :scroll-prev />
  </div>
</template>

<template>
  <div class="relative h-[100vh] bg-black text-white">
    <div v-if="list.length > 0" class="ui-container flex items-center overflow-hidden p-[50px]">
      <div class="ui-titles">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="title-item w-fit"
          :ref="
            (el) => {
              if (el && !item.ref) {
                item.ref = el as HTMLElement
                hoverEl[index] = useElementHover(el as HTMLElement)
              }
            }
          "
        >
          <router-link class="relative inline-block" :to="`/album/${item._id}`">
            <span class="title-wrap">
              <span class="title-ghost">
                <span>
                  {{ item.title }}
                </span>
                <span class="absolute inset-0 block" :style="{ 'pointer-events': 'all' }"></span>
              </span>
              <span class="title-main">{{ item.title }}</span>
              <span class="title-year">{{ item.year }}</span>
            </span>
          </router-link>
        </div>
      </div>

      <div class="ui-covers">
        <div v-for="(item, index) in list" :key="index" class="cover-item" :class="{ 'hover-cover': hoverEl[index]?.value }">
          <img :src="item.coverRef.imageUrl" />
        </div>
      </div>
    </div>

    <div class="more-button">
      <div class="relative">
        <router-link to="/gallerys">
          <span class="more-button-text">MORE+</span>
          <span class="more-button-ghost">MORE+</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '@/types/album'
import type { Response } from '@/types/response'

import { onMounted, ref } from 'vue'
import { useElementHover } from '@vueuse/core'
import request from '@/utils/request'

const list = ref<(Album & { ref: HTMLElement | null; hover: boolean; year: string })[]>([])
const hoverEl = ref<ReturnType<typeof useElementHover>[]>([])

onMounted(async () => {
  const res: Response<{ list: Album[]; total: number }> = await request.post('/gallery/album/list', { limit: 4 })

  list.value = res.data.list.map((item) => {
    return {
      ...item,
      year: new Date(item.createTime).getFullYear().toString(),
      ref: null,
      hover: false
    }
  })
})
</script>

<style lang="scss" scoped>
.ui-container {
  --ttf-2: cubic-bezier(0.075, 0.82, 0.165, 1);
  --ttf-5: cubic-bezier(0.165, 0.84, 0.4, 1);
  --ttf-6: cubic-bezier(0.6, 0.07, 0.17, 1);

  @apply relative h-full w-full;
}

.ui-titles {
  @apply relative z-[15] flex flex-col gap-y-[30px];
}

.title-wrap {
  @apply relative flex items-center text-[110px]/[88px];

  .title-main {
    transition: opacity var(--ttf-5);
    transition-duration: 2500ms;
  }

  .title-ghost {
    @apply absolute left-0 top-0 inline-block opacity-0;

    clip-path: polygon(0% -50%, 0% -50%, calc(0% - 1.5em) 150%, 0% 150%);
    transition:
      opacity 500ms 0ms,
      clip-path 0ms 500ms;
    transition-timing-function: var(--ttf-5) !important;

    z-index: 2;
  }

  .title-year {
    @apply absolute bottom-[1px] left-[calc(100%+0.1em)] text-[74%] opacity-[0.2];

    pointer-events: none;
    transition: 750ms var(--ttf-2);
    clip-path: polygon(0% -50%, 0% -50%, calc(0% - 1.5em) 150%, 0% 150%);
    transition-property: opacity, clip-path;
  }
}

.more-button {
  @apply absolute bottom-[32px] right-[32px] cursor-pointer p-[10px] text-[80px]/[60px];

  .more-button-text {
    transition: opacity var(--ttf-5);
    transition-duration: 2500ms;
  }

  .more-button-ghost {
    @apply absolute inset-0 inline-block opacity-0;

    clip-path: polygon(0% -50%, 0% -50%, calc(0% - 1.5em) 150%, 0% 150%);
    transition:
      opacity 500ms 0ms,
      clip-path 0ms 500ms;
    transition-timing-function: var(--ttf-5) !important;

    z-index: 2;
  }

  &:hover {
    .more-button-text {
      opacity: 0.05;
      transition-duration: 500ms;
    }

    .more-button-ghost {
      opacity: 1;
      clip-path: polygon(0% -50%, calc(100% + 1.5em) -50%, 100% 150%, 0% 150%);
      transition:
        opacity 0ms 0ms,
        clip-path 1000ms 0ms;
    }
  }
}

.ui-titles:hover .title-item:not(:hover) .title-main {
  transition-duration: 500ms !important;
  opacity: 0.2;
}

.title-item:hover {
  .title-main {
    opacity: 0.05;
    transition-duration: 500ms;
  }

  .title-ghost {
    opacity: 1;
    clip-path: polygon(0% -50%, calc(100% + 1.5em) -50%, 100% 150%, 0% 150%);
    transition:
      opacity 0ms 0ms,
      clip-path 1000ms 0ms;
  }

  .title-year {
    opacity: 0.2;
    transition-delay: 350ms;
    clip-path: polygon(0% -50%, calc(100% + 1.5em) -50%, 100% 150%, 0% 150%);
  }
}

.ui-covers {
  @apply absolute left-[10%] top-0 block h-full w-full;

  pointer-events: none;
}

.cover-item {
  @apply absolute right-0 top-[50%] z-[14] h-full w-full;

  img {
    @apply aspect-video h-[90%] translate-x-[3%] translate-y-[-45%] object-cover opacity-0 transition-[transform,opacity];

    transition-timing-function: var(--ttf-4);
    transition-duration: 1500ms;
  }
}

.hover-cover {
  img {
    opacity: 1;
    transform: translateY(-50%);
  }
}

.ui-container * {
  @apply will-change-transform;
}
</style>

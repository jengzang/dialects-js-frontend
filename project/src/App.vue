<!-- App.vue -->
<template>
  <component :is="layoutComponent" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 匯入 2 個 layout
import IntroLayout from './layouts/IntroLayout.vue'
import MenuLayout from './layouts/MenuLayout.vue'

const route = useRoute()

// 根據路由動態選擇 Layout
const layoutComponent = computed(() => {
  if (route.path.startsWith('/intro')) {
    return IntroLayout
  }

  return MenuLayout
})
</script>

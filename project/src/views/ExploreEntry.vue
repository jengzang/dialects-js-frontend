<template>
  <keep-alive>
    <component :is="activeComponent" :key="route.query.page" />
  </keep-alive>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 引入 explore 相关的页面组件
import YangChunVillages from "./explore/YangChunVillages.vue";

const route = useRoute()

// 根据 query.page 映射组件
const activeComponent = computed(() => {
  const page = route.query.page
  const pageMap = {
    ycVillages: YangChunVillages,
  }
  return pageMap[page] || YangChunVillages
})
</script>

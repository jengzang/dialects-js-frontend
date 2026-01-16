<template>
  <keep-alive>
    <component :is="activeComponent" :key="route.query.tab" />
  </keep-alive>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 引入你的所有页面组件
import QueryPage from './menu/QueryPage.vue'
import MapPage from './menu/MapPage.vue'
import ResultPage from './menu/ResultPage.vue'
import AboutPage from "@/views/menu/AboutPage.vue";
import SourcePage from "@/views/menu/SourcePage.vue";
import PrivacyPage from "@/views/menu/PrivacyPage.vue";
import SettingPage from "@/views/menu/SettingPage.vue";
import YangChunVillages from "@/views/menu/YangChunVillages.vue";
// ... 其他组件引入

const route = useRoute()

// 这里的逻辑就是你原来写在 router.js 里的
const activeComponent = computed(() => {
  const tab = route.query.tab
  const tabMap = {
    query: QueryPage,
    map: MapPage,
    result: ResultPage,
    source:SourcePage,
    privacy: PrivacyPage,
    setting:SettingPage,
    about: AboutPage,
    ycVillages:YangChunVillages,
    // ... 其他映射
  }
  return tabMap[tab] || QueryPage
})
</script>
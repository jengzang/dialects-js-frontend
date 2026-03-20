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
import ComparePage from './menu/ComparePage.vue'
import MapPage from './menu/MapPage.vue'
import ResultPage from './menu/ResultPage.vue'
import AboutPage from "@/views/menu/AboutPage.vue";
import SourcePage from "@/views/menu/chore/SourcePage.vue";
import PrivacyPage from "@/views/menu/chore/PrivacyPage.vue";
import ToolsPage from "@/views/menu/entry/ToolsPage.vue";
import PhoPage from "@/views/menu/PhoPage.vue";
import WordsPage from "@/views/menu/entry/WordsPage.vue";
import VillagesPage from "@/views/menu/entry/VillagesPage.vue";
import DialectClustering from "@/views/menu/DialectClustering.vue";
// ... 其他组件引入

const route = useRoute()

// 这里的逻辑就是你原来写在 router.js 里的
const activeComponent = computed(() => {
  const tab = route.query.tab
  // console.log('🔍 MenuEntry - 当前tab:', tab)
  // console.log('🔍 MenuEntry - 完整query:', route.query)

  const tabMap = {
    query: QueryPage,
    compare: ComparePage,
    map: MapPage,
    result: ResultPage,
    source:SourcePage,
    privacy: PrivacyPage,
    about: AboutPage,
    tools: ToolsPage,
    pho: PhoPage,
    words: WordsPage,
    villages: VillagesPage,
    cluster:DialectClustering,
    // ... 其他映射
  }

  const component = tabMap[tab] || QueryPage
  // console.log('🔍 MenuEntry - 选中的组件:', component.name || component.__name || 'Unknown')

  return component
})
</script>

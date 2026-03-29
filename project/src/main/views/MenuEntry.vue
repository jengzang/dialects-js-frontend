<template>
  <keep-alive>
    <component :is="activeComponent" :key="route.query.tab" />
  </keep-alive>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const createAsyncPage = (loader) => defineAsyncComponent({
  loader,
  delay: 120,
})

const QueryPage = createAsyncPage(() => import('./menu/QueryPage.vue'))
const ComparePage = createAsyncPage(() => import('./menu/ComparePage.vue'))
const MapPage = createAsyncPage(() => import('./menu/MapPage.vue'))
const ResultPage = createAsyncPage(() => import('./menu/ResultPage.vue'))
const AboutPage = createAsyncPage(() => import('@/main/views/menu/AboutPage.vue'))
const SourcePage = createAsyncPage(() => import('@/main/views/menu/chore/SourcePage.vue'))
const PrivacyPage = createAsyncPage(() => import('@/main/views/menu/chore/PrivacyPage.vue'))
const ToolsPage = createAsyncPage(() => import('@/main/views/menu/entry/ToolsPage.vue'))
const PhoPage = createAsyncPage(() => import('@/main/views/menu/PhoPage.vue'))
const WordsPage = createAsyncPage(() => import('@/main/views/menu/entry/WordsPage.vue'))
const VillagesPage = createAsyncPage(() => import('@/main/views/menu/entry/VillagesPage.vue'))
const DialectClustering = createAsyncPage(() => import('@/main/views/menu/DialectClustering.vue'))

const tabMap = {
  query: QueryPage,
  compare: ComparePage,
  map: MapPage,
  result: ResultPage,
  source: SourcePage,
  privacy: PrivacyPage,
  about: AboutPage,
  tools: ToolsPage,
  pho: PhoPage,
  words: WordsPage,
  villages: VillagesPage,
  cluster: DialectClustering,
}

const activeComponent = computed(() => {
  return tabMap[route.query.tab] || QueryPage
})
</script>

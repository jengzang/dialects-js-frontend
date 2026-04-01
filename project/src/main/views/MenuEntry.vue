<template>
  <keep-alive v-if="activeComponent">
    <component :is="activeComponent" :key="route.fullPath" />
  </keep-alive>
</template>

<script setup>
import { computed, defineAsyncComponent, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveLegacyMenuRoute } from '@/main/router/legacyRouteMap.js'

const route = useRoute()
const router = useRouter()

const createAsyncPage = (loader) => defineAsyncComponent({
  loader,
  delay: 120
})

const QueryPage = createAsyncPage(() => import('./menu/QueryPage.vue'))
const ComparePage = createAsyncPage(() => import('./menu/ComparePage.vue'))
const MapPage = createAsyncPage(() => import('./menu/MapPage.vue'))
const ResultPage = createAsyncPage(() => import('./menu/ResultPage.vue'))
const SourcePage = createAsyncPage(() => import('@/main/views/menu/support/SourcePage.vue'))
const PrivacyPage = createAsyncPage(() => import('@/main/views/menu/support/PrivacyPage.vue'))
const ToolsPage = createAsyncPage(() => import('@/main/views/menu/portals/ToolsPage.vue'))
const WordsPage = createAsyncPage(() => import('@/main/views/menu/portals/WordsPage.vue'))
const VillagesPage = createAsyncPage(() => import('@/main/views/menu/portals/VillagesPage.vue'))
const DialectClustering = createAsyncPage(() => import('@/main/views/menu/DialectClustering.vue'))

const tabMap = {
  query: QueryPage,
  compare: ComparePage,
  map: MapPage,
  result: ResultPage,
  source: SourcePage,
  privacy: PrivacyPage,
  tools: ToolsPage,
  words: WordsPage,
  villages: VillagesPage,
  cluster: DialectClustering
}

const activeComponent = computed(() => {
  if (resolveLegacyMenuRoute(route.query)) {
    return null
  }

  return tabMap[route.query.tab] || QueryPage
})

watch(
  () => route.fullPath,
  async () => {
    const legacyTarget = resolveLegacyMenuRoute(route.query)
    if (!legacyTarget) return

    await router.replace({
      path: legacyTarget.path,
      query: legacyTarget.query,
      hash: route.hash
    })
  },
  { immediate: true }
)
</script>

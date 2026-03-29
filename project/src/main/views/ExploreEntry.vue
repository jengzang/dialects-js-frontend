<template>
  <component :is="currentLayout">
    <keep-alive>
      <component :is="activeComponent" :key="route.query.page" />
    </keep-alive>
  </component>
</template>

<script setup>
import { computed, defineAsyncComponent, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const createAsyncPage = (loader) => defineAsyncComponent({
  loader,
  delay: 120,
})

const YangChunVillages = createAsyncPage(() => import('./explore/villages/YangChunVillages.vue'))
const CheckTool = createAsyncPage(() => import('./explore/tools/CheckTool.vue'))
const Jyut2IpaTool = createAsyncPage(() => import('./explore/tools/Jyut2IpaTool.vue'))
const MergeTool = createAsyncPage(() => import('./explore/tools/MergeTool.vue'))
const gdVillages = createAsyncPage(() => import('./explore/villages/gdVillagesTree.vue'))
const SimpleLayout = createAsyncPage(() => import('./explore/tools/TableManage.vue'))
const YangChunSpoken = createAsyncPage(() => import('./explore/word/YangChunSpoken.vue'))
const YuBaoPage = createAsyncPage(() => import('./explore/word/YuBaoPage.vue'))
const gdVillagesTable = createAsyncPage(() => import('./explore/villages/gdVillagesTable.vue'))
const Praat = createAsyncPage(() => import('@/main/views/Praat.vue'))
const VillagesML = createAsyncPage(() => import('@/main/views/explore/villages/VillagesML.vue'))
const CharacterClassification = createAsyncPage(() => import('./explore/charClass/CharacterClassification.vue'))

const pageMap = {
  ycVillages: YangChunVillages,
  check: CheckTool,
  jyut2ipa: Jyut2IpaTool,
  merge: MergeTool,
  gdVillages,
  manage: SimpleLayout,
  ycSpoken: YangChunSpoken,
  YuBao: YuBaoPage,
  gdVillagesTable,
  praat: Praat,
  CharacterClassification,
}

watch(() => route.query, (query) => {
  if (query.page === 'VillagesML' && query.module && query.module !== 'dashboard') {
    const { page, ...newQuery } = query
    router.replace({ path: '/villagesML', query: newQuery })
  }
}, { immediate: true })

const currentLayout = computed(() => {
  return 'div'
})

const activeComponent = computed(() => {
  const page = route.query.page
  const module = route.query.module

  if (page === 'VillagesML') {
    if (module === 'dashboard' || !module) {
      return VillagesML
    }
    return null
  }

  return pageMap[page] || Praat
})
</script>

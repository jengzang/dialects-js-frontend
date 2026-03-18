<template>
  <component :is="currentLayout">
    <keep-alive>
      <component :is="activeComponent" :key="route.query.page" />
    </keep-alive>
  </component>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 引入 explore 相关的页面组件
import YangChunVillages from "./explore/villages/YangChunVillages.vue";
import CheckTool from "./explore/tools/CheckTool.vue";
import Jyut2IpaTool from "./explore/tools/Jyut2IpaTool.vue";
import MergeTool from "./explore/tools/MergeTool.vue";
import gdVillages from "./explore/villages/gdVillagesTree.vue";
import SimpleLayout from "./explore/tools/TableManage.vue";
import YangChunSpoken from "./explore/pho/YangChunSpoken.vue";
import YuBaoPage from "./explore/pho/YuBaoPage.vue";
import gdVillagesTable from "./explore/villages/gdVillagesTable.vue";
import Praat from "@/views/Praat.vue";
import VillagesML from "@/views/explore/villages/VillagesML.vue";
import CharacterClassification from "./explore/pho/CharacterClassification.vue";

const route = useRoute()
const router = useRouter()

// 監聽路由變化，重定向 VillagesML 非 dashboard 模組到新路徑
watch(() => route.query, (query) => {
  if (query.page === 'VillagesML' && query.module && query.module !== 'dashboard') {
    // 重定向到新的 villagesML 路徑
    const newQuery = { module: query.module }
    if (query.subtab) {
      newQuery.subtab = query.subtab
    }
    router.replace({ path: '/villagesML', query: newQuery })
  }
}, { immediate: true })

// 根据 query.page 和 module 决定使用哪个 layout
const currentLayout = computed(() => {
  // All pages use default div layout (no extra wrapper)
  return 'div'
})

// 根据 query.page 映射组件
const activeComponent = computed(() => {
  const page = route.query.page
  const module = route.query.module

  // VillagesML 路由逻辑 - 只保留 dashboard
  if (page === 'VillagesML') {
    if (module === 'dashboard' || !module) {
      return VillagesML  // Dashboard 使用原 VillagesML.vue
    }
    // 其他模組會被 watch 重定向，這裡返回 null
    return null
  }

  // 其他页面映射
  const pageMap = {
    ycVillages: YangChunVillages,
    check: CheckTool,
    jyut2ipa: Jyut2IpaTool,
    merge: MergeTool,
    gdVillages:gdVillages,
    manage: SimpleLayout,
    ycSpoken: YangChunSpoken,
    YuBao: YuBaoPage,
    gdVillagesTable: gdVillagesTable,
    praat : Praat,
    CharacterClassification: CharacterClassification,
  }
  return pageMap[page] || CheckTool
})
</script>

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
import CheckTool from "./explore/CheckTool.vue";
import Jyut2IpaTool from "./explore/Jyut2IpaTool.vue";
import MergeTool from "./explore/MergeTool.vue";
import gdVillages from "./explore/gdVillagesTree.vue";
import SimpleLayout from "./explore/TableManage.vue";
// 从 menu 迁移过来的页面
import ZhongGuPage from "./explore/ZhongGuPage.vue";
import YangChunSpoken from "./explore/YangChunSpoken.vue";
import YuBaoPage from "./explore/YuBaoPage.vue";
import gdVillagesTable from "./explore/gdVillagesTable.vue";
import PhonologyMatrixPage from "./explore/PhonologyMatrixPage.vue";

const route = useRoute()

// 根据 query.page 映射组件
const activeComponent = computed(() => {
  const page = route.query.page
  const pageMap = {
    ycVillages: YangChunVillages,
    check: CheckTool,
    jyut2ipa: Jyut2IpaTool,
    merge: MergeTool,
    gdVillages:gdVillages,
    manage: SimpleLayout,
    // 从 menu 迁移过来的页面
    ZhongGu: ZhongGuPage,
    ycSpoken: YangChunSpoken,
    YuBao: YuBaoPage,
    gdVillagesTable: gdVillagesTable,
    phonologyMatrix: PhonologyMatrixPage,
  }
  return pageMap[page] || gdVillages
})
</script>

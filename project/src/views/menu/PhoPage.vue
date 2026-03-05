<template>
  <div class="pho-page">
    <TabsContainer :tabs="tabs" :default-tab="defaultTab">
      <template #default="{ currentTab }">
        <div class="pho-content">
          <KeepAlive>
            <component :is="getTabComponent(currentTab)" />
          </KeepAlive>
        </div>
      </template>
    </TabsContainer>
  </div>
</template>

<script setup>
import { KeepAlive } from 'vue'
import { useRoute } from 'vue-router'
import TabsContainer from '@/components/common/TabsContainer.vue'
import PhonologyMatrixPage from '@/components/pho/PhonologyPage.vue'
import PhonologyCustomPage from '@/components/pho/PhonologyCustom.vue'
import CountphosPage from '@/components/pho/Countphos.vue'
import ZhongGuPage from '@/components/pho/ZhongGuPage.vue'

const route = useRoute()

const defaultTab = route.query.sub || 'phonologyMatrix'

const tabs = [
  { name: 'phonologyMatrix', label: '音系' },
  { name: 'phonologyCustom', label: '音素分類' },
  { name: 'Countphos', label: '音節數' },
  { name: 'ZhongGu', label: '漢字類別' }
]

const tabComponentMap = {
  phonologyMatrix: PhonologyMatrixPage,
  phonologyCustom: PhonologyCustomPage,
  Countphos: CountphosPage,
  ZhongGu: ZhongGuPage
}

const getTabComponent = (tabName) => tabComponentMap[tabName] || PhonologyMatrixPage
</script>

<style scoped>
.pho-page {
  width: 100%;
}

.pho-content {
  width: 100%;
}
</style>

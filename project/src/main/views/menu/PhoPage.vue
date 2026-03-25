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
import { KeepAlive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import TabsContainer from '@/components/common/TabsContainer.vue'
import PhonologyMatrixPage from '@/main/components/pho/PhonologyPage.vue'
import PhonologyCustomPage from '@/main/components/pho/PhonologyCustom.vue'
import CountphosPage from '@/main/components/pho/Countphos.vue'
import PieVectorPage from '@/main/components/pho/PieVectorPage.vue'

const { t } = useI18n()
const route = useRoute()

const defaultTab = route.query.sub || 'phonologyMatrix'

const tabs = computed(() => [
  { name: 'phonologyMatrix', label: t('phonology.tabs.matrix') },
  { name: 'phonologyCustom', label: t('phonology.tabs.custom') },
  { name: 'Countphos', label: t('phonology.tabs.count') },
  { name: 'pieVector', label: t('phonology.tabs.pieVector') }
])

const tabComponentMap = {
  phonologyMatrix: PhonologyMatrixPage,
  phonologyCustom: PhonologyCustomPage,
  Countphos: CountphosPage,
  pieVector: PieVectorPage
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

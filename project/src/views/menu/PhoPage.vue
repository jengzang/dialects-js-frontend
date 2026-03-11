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
import PhonologyMatrixPage from '@/components/pho/PhonologyPage.vue'
import PhonologyCustomPage from '@/components/pho/PhonologyCustom.vue'
import CountphosPage from '@/components/pho/Countphos.vue'
import ZhongGuPage from '@/components/pho/ZhongGuPage.vue'

const { t } = useI18n()
const route = useRoute()

const defaultTab = route.query.sub || 'phonologyMatrix'

const tabs = computed(() => [
  { name: 'phonologyMatrix', label: t('phonology.tabs.matrix') },
  { name: 'phonologyCustom', label: t('phonology.tabs.custom') },
  { name: 'Countphos', label: t('phonology.tabs.count') },
  { name: 'ZhongGu', label: t('phonology.tabs.zhonggu') }
])

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

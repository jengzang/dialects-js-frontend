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
import { KeepAlive, computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import TabsContainer from '@/components/common/TabsContainer.vue'
import PhonologyMatrixPage from '@/main/components/pho/PhonologyPage.vue'
import PhonologyCustomPage from '@/main/components/pho/PhonologyCustom.vue'
import CountphosPage from '@/main/components/pho/Countphos.vue'
import EvolutionPage from '@/main/components/pho/EvolutionPage.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

watchEffect(() => {
  if (route.query.sub === 'pieVector') {
    router.replace({ query: { ...route.query, sub: 'evolution' } })
  }
})

const defaultTab = route.query.sub === 'pieVector' ? 'evolution' : (route.query.sub || 'phonologyMatrix')

const tabs = computed(() => [
  { name: 'phonologyMatrix', label: t('phonology.tabs.matrix') },
  { name: 'phonologyCustom', label: t('phonology.tabs.custom') },
  { name: 'Countphos', label: t('phonology.tabs.count') },
  { name: 'evolution', label: t('phonology.tabs.evolution') }
])

const tabComponentMap = {
  phonologyMatrix: PhonologyMatrixPage,
  phonologyCustom: PhonologyCustomPage,
  Countphos: CountphosPage,
  evolution: EvolutionPage
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

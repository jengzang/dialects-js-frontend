<template>
  <div />
</template>

<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveLegacyExploreRoute } from '@/main/router/legacyRouteMap.js'

const route = useRoute()
const router = useRouter()

watch(
  () => route.fullPath,
  async () => {
    const legacyTarget = resolveLegacyExploreRoute(route.query)
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

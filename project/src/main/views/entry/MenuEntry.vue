<template></template>

<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveLegacyMenuRoute } from '@/main/router/legacyRouteMap.js'

const route = useRoute()
const router = useRouter()

watch(
  () => route.fullPath,
  async () => {
    const legacyTarget = resolveLegacyMenuRoute(route.query)
    if (legacyTarget) {
      await router.replace({
        path: legacyTarget.path,
        query: legacyTarget.query,
        hash: route.hash
      })
      return
    }

    if (route.path === '/menu') {
      await router.replace({
        path: '/menu/query/zhonggu',
        hash: route.hash
      })
    }
  },
  { immediate: true }
)
</script>

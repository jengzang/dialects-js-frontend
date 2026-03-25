import { createRouter, createWebHistory } from 'vue-router'

import VillagesMLEntry from './Entry.vue'
import ExternalRouteBridge from './ExternalRouteBridge.vue'

const routes = [
  {
    path: '/villagesML/:pathMatch(.*)*',
    component: VillagesMLEntry,
  },
  {
    path: '/:pathMatch(.*)*',
    component: ExternalRouteBridge,
  },
]

const router = createRouter({
  base: '/',
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

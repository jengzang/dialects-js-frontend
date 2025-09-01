// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import LikeAuthor from './views/LikeAuthor.vue'
import Suggestions from './views/Suggestions.vue'
import Thanks from './views/Thanks.vue'

const routes = [
    { path: '/', redirect: '/like' },
    { path: '/like', component: LikeAuthor },
    { path: '/suggestions', component: Suggestions },
    { path: '/thanks', component: Thanks },
    { path: '/auth', component: () => import('./views/Auth.vue') }


]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

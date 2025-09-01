// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import LikeAuthor from './views/LikeAuthor.vue'
import Suggestions from './views/Suggestions.vue'
import Thanks from './views/Thanks.vue'
import auth from './views/Auth.vue'

const routes = [
    // { path: '/', redirect: '/like' },
    { path: '/like', component: LikeAuthor },
    { path: '/suggestions', component: Suggestions },
    { path: '/thanks', component: Thanks },
    { path: '/auth', component: auth },
    { path: '/', redirect: '/like' }
]
const router = createRouter({
    history: createWebHistory('/intro'),
    routes
})

export default router

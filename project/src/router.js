// src/router.js
import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import LikeAuthor from './views/intro/LikeAuthor.vue'
import Suggestions from './views/intro/Suggestions.vue'
import Thanks from './views/intro/Thanks.vue'
import Auth from './views/Auth.vue'
import QueryPage from './views/menu/QueryPage.vue'
import MapPage from './views/menu/MapPage.vue'
import ResultPage from './views/menu/ResultPage.vue'
import Source from "@/views/intro/Source.vue";
import AboutPage from "@/views/menu/AboutPage.vue";

const routes = [
    // ✅ 根路由 → 直接導到 /menu?tab=query
    {
        path: '/',
        redirect: { path: '/menu', query: { tab: 'query' } }
    },

    // ✅ /menu 佔位（由 beforeEach 動態注入組件）
    {
        path: '/menu',
        component: { render: () => null }
    },

    // ✅ /intro 佔位（由 beforeEach 動態注入組件）
    {
        path: '/intro',
        component: { render: () => null }
    },

    // 其他頁面
    {
        path: '/auth',
        component: Auth
    },

    // 可選：兜底導回首頁（避免 404）
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    base:'/',
    history: createWebHistory(),
    // ❗hash 模式不需要傳 base，傳 '/' 會被忽略
    // history: createWebHashHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

// ✅ 根據 query.tab 動態切換組件（/intro 與 /menu 各自映射）
router.beforeEach((to, from, next) => {
    if (!to.matched.length) return next()

    if (to.path === '/intro') {
        const tab = to.query.tab
        if (tab === 'thanks') {
            return next({ path: '/menu', query: { tab: 'about' } })
        }
        const tabMap = {
            like: LikeAuthor,
            suggestions: Suggestions,
            source:Source,
        }
        to.matched[0].components = {
            default: tabMap[tab] || LikeAuthor
        }
    }

    if (to.path === '/menu') {
        const tab = to.query.tab
        const tabMap = {
            query: QueryPage,
            map: MapPage,
            about: AboutPage,
            result: ResultPage,
        }
        to.matched[0].components = {
            default: tabMap[tab] || QueryPage
        }
    }

    next()
})

export default router


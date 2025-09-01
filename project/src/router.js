// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import LikeAuthor from './views/LikeAuthor.vue'
import Suggestions from './views/Suggestions.vue'
import Thanks from './views/Thanks.vue'
import auth from './views/Auth.vue'

const routes = [
    {
        path: '/',
        component: {
            render: () => null
        }
    },
    {
        path: '/auth',
        component: auth
    }
]

const router = createRouter({
    history: createWebHistory('/intro'),
    routes
})

// 根據 query.tab 動態切換組件（僅限 path === '/'）
router.beforeEach((to, from, next) => {
    if (to.path === '/') {
        const tab = to.query.tab;

        const tabMap = {
            like: LikeAuthor,
            suggestions: Suggestions,
            thanks: Thanks
        };

        to.matched[0].components = {
            default: tabMap[tab] || LikeAuthor
        };
    }

    next();
});

export default router

// src/router.js
import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import LikeAuthor from './views/intro/LikeAuthor.vue'
import Suggestions from './views/intro/Suggestions.vue'
import Thanks from './views/intro/Thanks.vue'
import Source from "@/views/intro/Source.vue";
import Auth from './views/Auth.vue'
import QueryPage from './views/menu/QueryPage.vue'
import MapPage from './views/menu/MapPage.vue'
import ResultPage from './views/menu/ResultPage.vue'
import AboutPage from "@/views/menu/AboutPage.vue";
import SourcePage from "@/views/menu/SourcePage.vue";
import PrivacyPage from "@/views/menu/PrivacyPage.vue";
import SettingPage from "@/views/menu/SettingPage.vue";
import MenuEntry from "@/views/MenuEntry.vue";
import ExploreEntry from "@/views/ExploreEntry.vue";

const routes = [
    // ✅ 根路由 → 直接導到 /menu?tab=query
    {
        path: '/',
        redirect: { path: '/menu', query: { tab: 'query' } }
    },

    // ✅ /menu 佔位（由 beforeEach 動態注入組件）
    {
        path: '/menu',
        component: MenuEntry
    },

    // ✅ /explore 探索页面（使用 SimpleLayout）
    {
        path: '/explore',
        component: ExploreEntry
    },

    // 其他頁面
    {
        path: '/auth',
        component: Auth,
        meta: { title: '方音圖鑑 - 登錄' }
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
const MenuTitleMap = {
    query: '方音圖鑑 - 查詢',
    result: '方音圖鑑 - 結果',
    map: '方音圖鑑 - 地圖',
    about:'方音圖鑑 - 關於網站',
    tools:'方音圖鑑 - 工具',
    gdVillages: '方音圖鑑 - 廣東自然村',
    ycSpoken: '方音圖鑑 - 陽春口語詞',
    source:'方音圖鑑 - 資料來源',
    privacy:'方音圖鑑 - 隱私',
    ZhongGu:'方音圖鑑 - 中古漢字地位',
    yubao:'方音圖鑑 - 語保資料'
};
const ExploreTitleMap = {
    ycVillages: '方音圖鑑 - 陽春自然村',
    check: '方音圖鑑 - 字表檢查',
    jyut2ipa: '方音圖鑑 - 粵拼轉ipa',
    merge:'方音圖鑑 - 字表合併',
    gdVillages:'方音圖鑑 - 廣東自然村樹狀圖',
    manage: '方音圖鑑 - 表格管理'
};

// 全局导航守卫
router.beforeEach((to, from, next) => {
    let title = '方音圖鑑'; // 默认标题

    if (to.meta.title) {
        title = to.meta.title;
    }

    // 如果是 /menu 页面，检查查询参数
    if (to.path === '/menu') {
        const tab = to.query.tab; // 获取 `tab` 参数
        title = MenuTitleMap[tab] || '方音圖鑑'; // 根据 `tab` 获取对应的标题，如果没有匹配到则使用默认标题
    }
    if (to.path === '/explore') {
        const tab = to.query.page; // 获取 `tab` 参数
        title = ExploreTitleMap[tab] || '方音圖鑑'; // 根据 `tab` 获取对应的标题，如果没有匹配到则使用默认标题
    }

    // 设置页面标题
    document.title = title;

    // 继续导航
    next();
});

// ✅ 根據 query.tab 動態切換組件（/intro 與 /menu 各自映射）
// router.beforeEach((to, from, next) => {
//     if (!to.matched.length) return next()
//
//     if (to.path === '/menu') {
//         const tab = to.query.tab
//         const tabMap = {
//             query: QueryPage,
//             map: MapPage,
//             about: AboutPage,
//             result: ResultPage,
//             source:SourcePage,
//             privacy: PrivacyPage,
//             setting:SettingPage,
//         }
//         to.matched[0].components = {
//             default: tabMap[tab] || QueryPage
//         }
//     }
//
//     next()
// })

export default router


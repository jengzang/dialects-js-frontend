// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import { h, computed } from 'vue'
import { useRoute } from 'vue-router'
import { userStore } from '@/store/store.js'
import { showWarning } from '@/utils/message.js'

import HomePage from '@/views/HomePage.vue'

const LikeAuthor = () => import('./views/intro/LikeAuthor.vue')
const Suggestions = () => import('./views/intro/Suggestions.vue')
const Thanks = () => import('./views/intro/Thanks.vue')
const Auth = () => import('./views/auth.vue')
const UserDataPage = () => import('./components/user/UserDataPage.vue')
const UserRegionPage = () => import('./components/user/UserRegionPage.vue')
const MenuEntry = () => import('@/views/MenuEntry.vue')
const ExploreEntry = () => import('@/views/ExploreEntry.vue')
const VillagesMLEntry = () => import('@/views/VillagesMLEntry.vue')
const IntroLayout = () => import('@/layouts/IntroLayout.vue')

const IntroEntry = {
  setup() {
    const route = useRoute()
    const activeComponent = computed(() => {
      const tab = route.query.tab
      const tabMap = {
        like: LikeAuthor,
        suggestions: Suggestions,
        thanks: Thanks,
      }
      return tabMap[tab] || LikeAuthor
    })
    return () => h(activeComponent.value)
  },
}

const routes = [
  {
    path: '/',
    component: HomePage,
    meta: { title: '方音圖鑑 - 首頁' }
  },
  {
    path: '/menu',
    component: MenuEntry,
  },
  {
    path: '/explore',
    component: ExploreEntry,
  },
  {
    path: '/villagesML',
    component: VillagesMLEntry,
  },
  {
    path: '/intro',
    component: IntroLayout,
    children: [
      {
        path: '',
        component: IntroEntry,
      },
    ],
  },
{
        path: '/auth',
        component: Auth,
        meta: { title: '方音圖鑑 - 登錄' }
    },

    {
        path: '/auth/data',
        component: UserDataPage,
        meta: { title: '方音圖鑑 - 個人數據管理' },

    },

    {
        path: '/auth/regions',
        component: UserRegionPage,
        meta: { title: '方音圖鑑 - 個人分區管理' }
    },

    // 可選：兜底導回首頁（避免 404）
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
  base: '/',
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

const MenuTitleMap = {
    query: '方音圖鑑 - 查詢',
    compare: '方音圖鑑 - 比較',
    result: '方音圖鑑 - 結果',
    map: '方音圖鑑 - 地圖',
    about:'方音圖鑑 - 關於網站',
    tools:'方音圖鑑 - 工具',
    pho:'方音圖鑑 - 音系',
    cluster:'方音圖鑑 - 聚類',
    words:'方音圖鑑 - 詞彙',
    villages:'方音圖鑑 - 自然村',
    source:'方音圖鑑 - 資料來源',
    privacy:'方音圖鑑 - 隱私',
};
const ExploreTitleMap = {
    ycVillages: '方音圖鑑 - 陽春自然村',
    check: '方音圖鑑 - 字表檢查',
    jyut2ipa: '方音圖鑑 - 粵拼轉ipa',
    merge:'方音圖鑑 - 字表合併',
    gdVillages:'方音圖鑑 - 廣東自然村樹狀圖',
    manage: '方音圖鑑 - 表格管理',
    ycSpoken: '方音圖鑑 - 陽春口語詞',
    YuBao:'方音圖鑑 - 語保資料',
    gdVillagesTable: '方音圖鑑 - 廣東自然村表格',
    phonologyMatrix: '方音圖鑑 - 音系表',
    phonologyCustom: '方音圖鑑 - 自定義音素表',
    Countphos: '方音圖鑑 - 音節統計',
    praat: '方音圖鑑 - 實驗語音學',
    VillagesML: '方音圖鑑 - 自然村機器學習',
    CharacterClassification: '方音圖鑑 - 漢字類別'
};

// 全局导航守卫
router.beforeEach((to, from, next) => {
    let title = '方音圖鑑'; // 默认标题

  if (to.meta.title) {
    title = to.meta.title
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

    // 1. 登錄守衛邏輯
    if (to.path === '/auth/data' || to.path === '/auth/regions') {
        // 如果未登錄，直接攔截並跳轉到登錄頁
        if (!userStore.isAuthenticated) {
            showWarning('未授權訪問，跳回登錄頁');
            return next({ path: '/auth', replace: true });
        }
    }

    // 设置页面标题
    document.title = title;

    // 继续导航
    next();
});

export default router

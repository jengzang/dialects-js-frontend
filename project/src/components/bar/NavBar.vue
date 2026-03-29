<template>
  <div class="navbar">
    <!-- 桌面端的布局 -->
    <div class="navbar-desktop">
      <div  class="navbar-item logo-and-title" :style="{ zIndex: isSidebarVisible ? '1100' : '999' }">
        <div @click="toggleSidebar" class="logo-container" style="min-width: 6dvh;width: 6dvh;">
          <img class="logo" src="../../assets/favicon.ico" alt="Logo" />
        </div>
        <div class="title">
          <img src="../../assets/picture/title.png" alt="Title" />
        </div>
      </div>
      <nav class="navbar-btn">
        <RouterLink
            v-for="t in tabs"
            :key="t.tab"
            :to="t.to || { path: '/menu', query: { tab: t.tab } }"
            custom
            v-slot="{ href, navigate, isActive }"
        >
          <a
              :href="href"
              class="menu-item"
              :class="[
                { active: isActiveComputed(t.tab, isActive) },
                t.cssClass
              ]"
              :style="{
                flex: getFlexWeight(t, isActiveComputed(t.tab, isActive), false) + ' 1 0',
                fontSize: t.fontSize + 'rem'
              }"
          @click.prevent="onClick(t, navigate)"
          >
          <span class="emoji">{{ t.icon }}</span>
          <span
            class="label"
            v-if="!t.showLabelOnlyWhenActive || isActiveComputed(t.tab, isActive)"
          >{{ t.label }}</span>
          </a>
        </RouterLink>
      </nav>
      <div class="logo-container" style="color: #005fd3;border-radius: 30px" @click="goToAuthPage">
        <!-- 显示用户名或"登录" -->
        <span class="login-text">
          {{ userStore.username || t('navigation.login') }}
        </span>
      </div>
    </div>

    <!-- 左侧边栏 -->
    <Transition name="slide-fade">
      <div class="sidebar main-sidebar-shell" v-if="isSidebarVisible">
        <div class="sidebar-empty main-sidebar-empty"></div>
        <div class="sidebar-content main-sidebar-content">
          <ul class="main-sidebar-list">
            <li
              v-for="(item, key) in filteredMenuConfig"
              :key="key"
              class="main-sidebar-item"
              @click="handleMainClick(item, key, $event)"
              @mouseenter="handleItemMouseEnter(item, key, $event)"
              @mouseleave="item.children && !isMobile ? scheduleCloseSubmenu() : null"
            >
              <span role="img" :aria-label="key">{{ item.icon }}</span>
              {{ item.label }}
            </li>
          </ul>

          <!-- 访问统计区域 -->
          <div class="visit-stats main-sidebar-stats">
            <div class="stats-summary main-sidebar-stats-summary">
              <div class="stat-item">
                <span class="stat-label">{{ t('navigation.stats.today') }}</span>
                <span class="stat-value">{{ todayVisits }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ t('navigation.stats.totalVisits') }}</span>
                <span class="stat-value">{{ totalVisits }}</span>
              </div>
              <button class="expand-btn main-sidebar-expand-btn" @click="toggleStatsPanel">
                📊
              </button>
            </div>
          </div>

          <div class="icp-number">��ICP��2025466875��</div>
        </div>
      </div>
    </Transition>

    <!-- 遮罩�?-->
    <Transition name="fade">
      <div class="overlay main-sidebar-overlay" v-if="isSidebarVisible" @click="toggleSidebar"></div>
    </Transition>

    <!-- Submenu panel (liquid glass style) -->
    <Teleport to="body">
      <Transition name="submenu-fade">
        <div
          v-if="activeSubmenu"
          class="submenu-panel main-sidebar-submenu-panel"
          :style="{
            top: submenuPosition.top + 'px',
            left: submenuPosition.left + 'px'
          }"
          @click.stop
          @mouseenter="!isMobile ? cancelCloseSubmenu() : null"
          @mouseleave="!isMobile ? scheduleCloseSubmenu() : null"
        >
          <div
            v-for="(child, index) in menuConfigData[activeSubmenu]?.children"
            :key="index"
            class="submenu-item main-sidebar-submenu-item"
            @click="handleSubmenuClick(child)"
          >
            <span class="submenu-icon">{{ child.icon }}</span>
            <span class="submenu-label">{{ child.label }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 访问历史弹窗 -->
    <Teleport to="body">
      <Transition name="fade-scale">
        <div v-if="isStatsExpanded" class="modal-overlay" @click.self="closeStatsPanel">
          <div class="glass-card stats-modal-card close-btn-host">
            <button class="close-btn close-btn-lg close-btn-corner" @click="closeStatsPanel">&times;</button>
            <h3 class="modal-title">📊 {{ t('navigation.stats.historyTitle') }}</h3>

            <div v-if="loadingStats" class="loading-state">
              <div class="loading-spinner"></div>
              <p>{{ t('navigation.stats.loading') }}</p>
            </div>

            <div v-else class="stats-content">
              <div class="stats-summary-large">
                <div class="stat-card">
                  <div class="stat-icon">📅</div>
                  <div class="stat-info">
                    <span class="stat-label-large">{{ t('navigation.stats.todayVisits') }}</span>
                    <span class="stat-value-large">{{ todayVisits }}</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🌐</div>
                  <div class="stat-info">
                    <span class="stat-label-large">{{ t('navigation.stats.totalVisits') }}</span>
                    <span class="stat-value-large">{{ totalVisits }}</span>
                  </div>
                </div>
              </div>

              <div class="history-section">
                <h4 class="section-title">{{ t('navigation.stats.historyRecords') }}</h4>
                <div class="history-list">
                  <div v-for="item in visitHistory" :key="item.date" class="history-item-modal">
                    <span class="history-date">{{ item.date }}</span>
                    <div class="history-bar-container">
                      <div
                        class="history-bar"
                        :style="{ width: (item.count / Math.max(...visitHistory.map(v => v.count)) * 100) + '%' }"
                      ></div>
                    </div>
                    <span class="history-count">{{ item.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="navbar-content">
      <!-- 第一�? Logo、标题和登录按钮 -->
      <div class="navbar-top">
        <div class="navbar-item logo-and-title" :style="{ zIndex: isSidebarVisible ? '1100' : '999' }">
          <div @click="toggleSidebar" class="logo-container" style="width: 6dvh;min-width: 6dvh" >
            <img class="logo" src="../../assets/favicon.ico" alt="Logo" />
          </div>
          <div class="title">
            <img src="../../assets/picture/title.png" alt="Title" />
          </div>
        </div>
        <div class="logo-container" style="color: #005fd3; border-radius: 30px;height: 5dvh" @click="goToAuthPage">
          <!-- 显示用户名或"登录" -->
          <span class="login-text">
            {{ userStore.username || t('navigation.login') }}
          </span>
        </div>
      </div>

      <!-- 第二�? 导航按钮 -->
      <div class="navbar-bottom">
        <RouterLink
            v-for="t in tabs"
            :key="t.tab"
            :to="t.to || { path: '/menu', query: { tab: t.tab } }"
            custom
            v-slot="{ href, navigate, isActive }"
        >
          <a
              v-if="!t.hideOnMobile"
              :href="href"
              class="menu-item"
              :class="[
                { active: isActiveComputed(t.tab, isActive) },
                t.cssClass
              ]"
              :style="{
                flex: getFlexWeight(t, isActiveComputed(t.tab, isActive), true) + ' 1 0',
                fontSize: (t.mobileFontSize || t.fontSize) + 'rem'
              }"
              @click.prevent="onClick(t, navigate)"
          >
            <span class="emoji">{{ t.icon }}</span>
            <span
              class="label"
              v-if="!t.hideLabelOnMobile && (!(t.mobileShowLabelOnlyWhenActive ?? t.showLabelOnlyWhenActive) || isActiveComputed(t.tab, isActive))"
            >{{ t.label }}</span>
          </a>
        </RouterLink>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref , onMounted, onBeforeUnmount, computed, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { useI18n } from 'vue-i18n'
// import { clearToken, getToken, saveToken } from '../../api/auth/auth.js'
import { getTodayVisits, getTotalVisits, getVisitHistory } from '@/api/logs/index.js'
import { useMenuConfig } from '@/main/config/SideBarConfig.js'
import { useMenuTabsConfig } from '@/main/config/TabsConfig.js'
import { WEB_BASE } from '@/env-config.js'
import { userStore, resultCache } from '@/main/store/store.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isSidebarVisible = ref(false)  // 控制边栏显示
const menuConfigRef = useMenuConfig()

// Submenu state management
const activeSubmenu = ref(null)  // Currently open submenu key
const submenuPosition = ref({ top: 0, left: 0 })  // Position for submenu panel
const closeSubmenuTimeout = ref(null)  // Timeout for delayed closing

// ===== sessionStorage 管理：记住每�?tab 的最后访问的 sub =====
const STORAGE_KEY_PREFIX = 'menu_last_sub_'

// 获取某个 tab 的最后访问的 sub
function getLastSub(tab) {
  try {
    return sessionStorage.getItem(STORAGE_KEY_PREFIX + tab)
  } catch (e) {
    console.warn('Failed to read from sessionStorage:', e)
    return null
  }
}

// 保存某个 tab 的最后访问的 sub
function saveLastSub(tab, sub) {
  try {
    if (sub) {
      sessionStorage.setItem(STORAGE_KEY_PREFIX + tab, sub)
    } else {
      sessionStorage.removeItem(STORAGE_KEY_PREFIX + tab)
    }
  } catch (e) {
    console.warn('Failed to write to sessionStorage:', e)
  }
}

// 监听路由变化，记录当前的 tab �?sub
watch(() => route.query, (query) => {
  if (query.tab && query.sub) {
    saveLastSub(query.tab, query.sub)
  }
}, { immediate: true })

function getTargetTabKey(tabConfig) {
  const routeTab = tabConfig?.to?.query?.tab
  return routeTab || tabConfig?.tab || null
}
// ===== sessionStorage 管理结束 =====

// Mobile detection
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  // console.log("ismobile")
}

// Filter menu items for NavBar (exclude items that should only show in SimpleSidebar)
const filteredMenuConfig = computed(() => {
  const filtered = {}
  for (const [key, item] of Object.entries(menuConfigRef.value)) {
    // If showIn is not specified, show in all components
    // If showIn is specified, only show if 'NavBar' is in the array
    if (!item.showIn || item.showIn.includes('NavBar')) {
      filtered[key] = item
    }
  }
  return filtered
})

const menuConfigData = computed(() => menuConfigRef.value)

// 访问统计相关
const todayVisits = ref(0)
const totalVisits = ref(0)
const isStatsExpanded = ref(false)
const visitHistory = ref([])
const loadingStats = ref(false)

// 过滤可见�?tabs（label 已在 TabsConfig 中定义）
const allMenuTabs = useMenuTabsConfig()
const visibleTabs = computed(() => {
  return allMenuTabs.value.filter(tab => {
    // 如果�?visibleWhen 函数，执行它
    if (typeof tab.visibleWhen === 'function') {
      return tab.visibleWhen()
    }
    // 没有 visibleWhen 则默认可�?
    return true
  })
})

// 使用过滤后的 tabs
const tabs = visibleTabs

/**
 * Calculate dynamic flex weight based on label visibility
 * @param {Object} tab - Tab configuration object
 * @param {boolean} isActive - Whether the tab is currently active
 * @param {boolean} isMobile - Whether in mobile layout
 * @returns {number} - Flex weight value
 */
const getFlexWeight = (tab, isActive, isMobile) => {
  // Determine if label is visible based on configuration
  let labelVisible

  if (isMobile) {
    // Mobile: Check hideLabelOnMobile and mobileShowLabelOnlyWhenActive
    const showOnlyWhenActive = tab.mobileShowLabelOnlyWhenActive ?? tab.showLabelOnlyWhenActive
    labelVisible = !tab.hideLabelOnMobile && (!showOnlyWhenActive || isActive)
  } else {
    // Desktop: Check showLabelOnlyWhenActive
    labelVisible = !tab.showLabelOnlyWhenActive || isActive
  }

  // Return appropriate weight based on label visibility
  if (labelVisible) {
    // Label is visible - use full weight
    return isMobile ? (tab.mobileWeight || tab.weight) : tab.weight
  } else {
    // Label is hidden - use icon-only weight with fallback chain
    if (isMobile) {
      return tab.mobileWeightIconOnly || tab.mobileWeight || tab.weightIconOnly || tab.weight
    } else {
      return tab.weightIconOnly || tab.weight
    }
  }
}

// 根据当前 query.tab 判断
const currentTab = () => route.query.tab || route.query.page || 'query'

// 检查路由是否匹�?
const isRouteMatch = (targetRoute) => {
  if (!targetRoute) return false

  // 检查路径是否匹�?
  if (route.path !== targetRoute.path) return false

  // 检�?query 参数是否匹配
  if (targetRoute.query) {
    for (const [key, value] of Object.entries(targetRoute.query)) {
      if (route.query[key] !== value) return false
    }
  }

  return true
}

const isActiveComputed = (tabName, isActive) => {
  // �?tab 永远不显示为激活状�?
  if (tabName === 'tools') return false

  // 查找对应�?tab 配置
  const tabConfig = tabs.value.find(t => t.tab === tabName)
  if (!tabConfig || !tabConfig.to) return false

  // 使用路由匹配检�?
  return isRouteMatch(tabConfig.to)
}

// 頂部導航欄的點擊處理
const onClick = async (tabConfig, navigate) => {
  // �?tab 处理：打开侧边栏而非导航
  if (tabConfig.isPseudo) {
    toggleSidebar()
    return
  }

  // 检查是否有记录�?sub
  const targetTabKey = getTargetTabKey(tabConfig)
  const lastSub = targetTabKey ? getLastSub(targetTabKey) : null

  // 构建目标路由
  let targetRoute
  if (tabConfig.to) {
    // 如果配置�?to，使用配置的路由
    targetRoute = tabConfig.to

    // 如果有记录的 sub，添加到 query �?
    if (lastSub && typeof targetRoute === 'object') {
      targetRoute = {
        ...targetRoute,
        query: {
          ...targetRoute.query,
          sub: lastSub
        }
      }
    }
  } else {
    // 如果没有配置 to，使用默认的 /menu?tab=xxx
    targetRoute = {
      path: '/menu',
      query: {
        tab: targetTabKey || tabConfig.tab,
        ...(lastSub ? { sub: lastSub } : {})
      }
    }
  }

  // 防止重复导航到当前路�?
  if (isRouteMatch(targetRoute)) return

  // 导航到目标路�?
  await router.replace(targetRoute)
}

const goToAuthPage = () => {
  // 如果用户已登录，跳转到个人资料页面；否则跳转到登录页�?
  if (userStore.isAuthenticated) {
    router.push({ path: '/auth', query: { view: 'profile' } })
  } else {
    router.push('/auth')
  }
}

// 获取访问统计数据
async function fetchVisitStats() {
  try {
    const [todayData, totalData] = await Promise.all([
      getTodayVisits(),
      getTotalVisits()
    ])

    todayVisits.value = todayData?.today_visits || 0
    totalVisits.value = totalData?.total_visits || 0
  } catch (error) {
    console.error('获取访问统计失败:', error)
  }
}

// 切换统计面板展开/收起
async function toggleStatsPanel() {
  isStatsExpanded.value = !isStatsExpanded.value

  // 首次展开时加载历史数�?
  if (isStatsExpanded.value && visitHistory.value.length === 0) {
    await fetchVisitHistory()
  }
}

// 关闭统计面板
function closeStatsPanel() {
  isStatsExpanded.value = false
}

// 获取访问历史
async function fetchVisitHistory() {
  loadingStats.value = true
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 60); // 30天前
    const endDate = today;

    const start_date = startDate.toISOString().split('T')[0];  // 格式化为 'YYYY-MM-DD'
    const end_date = endDate.toISOString().split('T')[0];      // 格式化为 'YYYY-MM-DD'

    const data = await getVisitHistory({ start_date, end_date, limit: 9999 })


    // 按日期汇总数�?
    const dateMap = new Map()
    data?.data?.forEach(item => {
      const date = item.date
      if (!dateMap.has(date)) {
        dateMap.set(date, 0)
      }
      dateMap.set(date, dateMap.get(date) + item.count)
    })

    // 转换为数组并排序
    visitHistory.value = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (error) {
    console.error('获取访问历史失败:', error)
  } finally {
    loadingStats.value = false
  }
}


// 切换左侧边栏的显示与隐藏
const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
  // Close submenu when sidebar closes
  if (!isSidebarVisible.value) {
    activeSubmenu.value = null
  }
}

// 主按鈕點擊處�?- 有子菜單則展開，無子菜單則導�?
const handleMainClick = (item, key, event) => {
  event?.stopPropagation()  // 阻止事件冒泡
  cancelCloseSubmenu()  // 取消任何待處理的關閉

  if (item.children) {
    // 有子菜單，展開子菜單
    handleArrowClick(item, key, event)
  } else if (item.path) {
    // 無子菜單且有路徑，導�?
    if (item.external) {
      window.location.href = WEB_BASE + item.path
    } else {
      // 檢查是否有保存的 sub 參數
      const url = new URL(item.path, window.location.origin)
      const tab = url.searchParams.get('tab')

      if (tab && item.children && item.children.length > 0) {
        // 如果�?tab 且有子菜單，嘗試�?sessionStorage 獲取最後訪問的 sub
        const lastSub = sessionStorage.getItem(`lastVisitedSub_${tab}`)
        if (lastSub) {
          url.searchParams.set('sub', lastSub)
          router.push(url.pathname + url.search)
        } else {
          router.push(item.path)
        }
      } else {
        router.push(item.path)
      }
      isSidebarVisible.value = false
    }
  } else {
    // 沒有路徑就console
    console.log('按鈕點擊 - 需要設置導航路�?', key, item)
  }
}

// 處理項目鼠標進入
const handleItemMouseEnter = (item, key, event) => {
  cancelCloseSubmenu()  // 取消任何待處理的關閉
  if (!isMobile.value && item.children) {
    handleArrowClick(item, key, event)
  }
}

// 箭頭點擊處理 - 展開子菜�?
const handleArrowClick = (item, key, event) => {
  event?.stopPropagation()  // 阻止事件冒泡
  cancelCloseSubmenu()  // 取消任何待處理的關閉

  if (item.children) {
    // 判斷事件來源：如果是箭頭點擊，需要取 parentElement；如果是 li hover，直接用 currentTarget
    const targetElement = event.currentTarget.classList?.contains('menu-arrow')
      ? event.currentTarget.parentElement
      : event.currentTarget

    const rect = targetElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const submenuWidth = 250 // 預估子菜單寬�?

    // 計算是否有足夠空間在右側顯示
    const spaceOnRight = viewportWidth - rect.right
    const hasSpaceOnRight = spaceOnRight > submenuWidth + 20

    if (hasSpaceOnRight) {
      // 右側有空間，顯示在右�?
      submenuPosition.value = {
        top: rect.top,
        left: rect.right + 10
      }
    } else {
      // 右側空間不足，顯示在按鈕下方
      submenuPosition.value = {
        top: rect.bottom + 5,
        left: Math.max(10, rect.left) // 確保不會超出左邊�?
      }
    }

    activeSubmenu.value = activeSubmenu.value === key ? null : key // Toggle
  }
}

// Submenu item click handler
const handleSubmenuClick = (child) => {
  cancelCloseSubmenu()
  if (child.external) {
    window.open(child.path, '_blank')
  } else {
    // 保存當前選擇�?sub �?sessionStorage
    const url = new URL(child.path, window.location.origin)
    const tab = url.searchParams.get('tab')
    const sub = url.searchParams.get('sub')

    if (tab && sub) {
      sessionStorage.setItem(`lastVisitedSub_${tab}`, sub)
    }

    router.push(child.path)
  }
  activeSubmenu.value = null
  isSidebarVisible.value = false
}

// 延遲關閉子菜�?
const scheduleCloseSubmenu = () => {
  closeSubmenuTimeout.value = setTimeout(() => {
    activeSubmenu.value = null
  }, 300)  // 300ms 延遲
}

// 取消延遲關閉
const cancelCloseSubmenu = () => {
  if (closeSubmenuTimeout.value) {
    clearTimeout(closeSubmenuTimeout.value)
    closeSubmenuTimeout.value = null
  }
}

// Close submenu when clicking outside
const closeSubmenu = () => {
  cancelCloseSubmenu()
  activeSubmenu.value = null
}

onMounted(async () => {
  checkMobile();
  await fetchVisitStats();
  document.addEventListener('click', closeSubmenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSubmenu)
})
</script>


<style scoped>
/* 父容器，標題欄背�?*/
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;

  box-shadow: var(--shadow-glass-inset);
  background: var(--glass-gradient-nav);
  border: 1px solid var(--glass-border-weak);
  backdrop-filter: blur(6px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}


/* 桌面端布局 */
.navbar-desktop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0.5%;
  height: 10dvh;
}

.navbar-btn {
  margin: 0 30px;
  width: 100%;
  max-width: 900px;
  justify-content: center;
  align-items: center;
  display: flex;
  height: 10dvh; /* 使其撑满父容器的高度 */
}

.navbar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-white);
  font-size: 1rem;
  padding: 0.5%;
  transition: transform 0.3s;
}

.navbar-item:hover {
  transform: scale(1.05);
}

.logo-and-title {
  margin-top: 5px;
  margin-left: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.ico img {
  padding: 0;
}

/* 圆形logo背景 */
.logo-container {
  width: 9dvh; /* 宽度可以调整 */
  max-width: 15dvh;
  min-width: 9dvh;
  height: 6dvh; /* 高度可以调整 */
  border-radius: 50%;
  backdrop-filter: blur(15px) saturate(150%); /* 玻璃效果 */
  -webkit-backdrop-filter: blur(15px) saturate(150%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px; /* 使图片不贴边 */
  flex: 1 1 0;
  text-align: center;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)); /* 柔和透明的漸�?*/
  color: darkblue;
  font-weight: 1000;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.08); /* 輕微陰影，玻璃感 */
  border: 3px solid rgba(255, 255, 255, 0.4); /* 半透明邊框 */
  transition: all 0.3s ease;
}

.logo {
  width: 90%; /* 控制logo图片的大�?*/
  height: auto;
}

.title img {
  padding: 0;
  height: 10dvh;
  object-fit: contain;
}

.menu-item {
  height: 10dvh;
  display: flex;
  align-items: center;
  white-space: nowrap;
  justify-content: center;
  font-size: 1.3rem;
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.25s ease;
  gap: 1px;
  cursor: pointer;
  user-select: none;
  background: rgba(255, 255, 255, 0.10);
  color: #007aff; /* 預設文字用蘋果藍半透明 */
}

.menu-item:hover {
  background: rgba(0, 122, 255, 0.12);
  height: 90%;
  color: #007aff;
}

.menu-item.active {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)); /* 柔和透明的漸�?*/
  color: darkblue;
  font-weight: 1000;
  border-radius: 0 0 25px 25px; /* 圓角邊框 */
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.08); /* 輕微陰影，玻璃感 */
  border: 3px solid rgba(255, 255, 255, 0.4); /* 半透明邊框 */
  transition: all 0.3s ease;
}

.menu-item.active:hover {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3)); /* 柔和透明的漸�?*/
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2); /* 鼠標懸停時增強陰�?*/
  margin:0;
}

.login-text {
  display: block;
  max-width: 100px;  /* 根据需要调整最大宽�?*/
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}



/* 移动端布局 */
.navbar-content {
  display: none;
  flex-direction: column;
  width: 100%;
  top:0;
  height:16.5dvh;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5%;
  position: relative; /* 设置父容器的定位属�?*/
  gap:0.5dvh;
}

/* 第一�? Logo、标题和登录按钮 */
.navbar-top {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  height: 10dvh;
  width: 100%;
  position: relative; /* �?.navbar-top 设置定位属�?*/
}

.navbar-top .logo-container {
  width: 6dvh;
  height: 6dvh;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  color: #005fd3;
  cursor: pointer;
  user-select: none;
}

.navbar-top .login-text {
  display: block;
  max-width: 100px; /* 根据需要调整最大宽�?*/
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 第二�? 导航按钮 */
.navbar-bottom {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  width:100%;
  height: 6dvh;
}



@media (max-aspect-ratio: 1/1) {
  /* 隐藏桌面端布局 */
  .navbar-desktop {
    display: none;
  }

  /* 显示移动端布局 */
  .navbar-content {
    display: flex;
  }
  .menu-item{
    height: 6dvh!important;
    border-radius: 30px!important;
  }
  .title img{
    height: 9dvh!important;
  }
}


.icp-number {
  text-align: center;
  font-size: 14px;
  color: #575757;
}


.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.stat-label {
  font-size: 12px;
  white-space: nowrap;
  color: #666;
  font-weight: 600;
}

.stat-value {
  font-size: 18px;
  color: #005fd3;
  font-weight: 900;
}


/* 弹窗样式 */
.stats-modal-card {
  max-width: 700px;
  width: 90%;
  max-height: 80dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding:10px;
}

.stats-content {
  padding: 5px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 95, 211, 0.1);
  border-top-color: #005fd3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stats-summary-large {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
  line-height: 1;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label-large {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.stat-value-large {
  font-size: 26px;
  color: #005fd3;
  font-weight: 900;
  line-height: 1;
}

.history-section {
  margin-top: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #8e8e93;
  margin: 0 0 12px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50dvh;
  overflow-y: auto;
}

.history-item-modal {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.history-item-modal:hover {
  background: rgba(255, 255, 255, 0.6);
}

.history-date {
  font-size: 13px;
  color: #444;
  font-weight: 600;
  white-space: nowrap;
}

.history-bar-container {
  height: 20px;
  background: rgba(0, 95, 211, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.history-bar {
  height: 100%;
  background: linear-gradient(90deg, #005fd3, #0080ff);
  border-radius: 10px;
  transition: width 0.5s ease;
  min-width: 2%;
}

.history-count {
  font-size: 15px;
  color: #005fd3;
  font-weight: 700;
  text-align: right;
}

/* 自定义滚动条 */
.history-list::-webkit-scrollbar {
  width: 8px;
}

.history-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(0, 95, 211, 0.3);
  border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 95, 211, 0.5);
}

.stats-content::-webkit-scrollbar {
  width: 8px;
}

.stats-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.stats-content::-webkit-scrollbar-thumb {
  background: rgba(0, 95, 211, 0.3);
  border-radius: 4px;
}

.stats-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 95, 211, 0.5);
}


/* 过渡动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Sidebar 滑动动画 */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.5, 0, 0.75, 0);
}

.slide-fade-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Overlay 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


/* 响应式样式，移动端显示边�?*/
@media (max-aspect-ratio: 1/1)  {
  .navbar-desktop {
    display: none;
  }
  .navbar-content {
    display: flex;
  }
}

/* Arrow indicator for expandable items */
.menu-arrow {
  font-size: 18px;
  font-weight: bold;
  color: #007aff;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 122, 255, 0.15);
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
}

.menu-arrow:hover {
  transform: scale(1.15);
  background: rgba(0, 122, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.menu-arrow:active {
  transform: scale(1.05);
}

.submenu-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.submenu-label {
  flex: 1;
  white-space: nowrap;
}

/* Submenu fade transition */
.submenu-fade-enter-active,
.submenu-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.submenu-fade-enter-from {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}

.submenu-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}

/* Mobile responsive submenu */
@media (max-width: 768px) {
  .submenu-panel {
    /* 在移動設備上確保不會超出螢幕 */
    max-width: calc(100vw - 20px);
  }
}


.modal-overlay {
  --overlay-padding: 0;
}
</style>

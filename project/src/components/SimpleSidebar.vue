<!-- SimpleSidebar.vue - 简化的侧边栏 -->
<template>
  <!-- 遮罩层 -->
  <Transition name="fade">
    <div v-if="isOpen" class="overlay" @click="$emit('close')"></div>
  </Transition>

  <!-- 侧边栏 -->
  <Transition name="slide-fade">
    <div v-if="isOpen" class="sidebar">
      <!-- 标题图片 -->
      <div class="sidebar-header">
        <img src="@/assets/title.png" alt="Title" class="title-img" />
      </div>

      <div class="sidebar-content">
        <ul>
          <!-- 返回查询按钮 -->
          <li @click="goToQuery">
            <span role="img" aria-label="query">📊</span> 返回查詢
          </li>

          <!-- navbar 的所有链接 -->
          <li @click="goToOldWebsite">
            <span role="img" aria-label="old-website">🕰️</span> 舊版網站
          </li>
          <li @click="goToTools">
            <span role="img" aria-label="tools">🧰</span> 字表工具
          </li>
          <li @click="goToZhongGu">
            <span role="img" aria-label="ZhongGu">✍️</span> 中古地位
          </li>
          <li @click="goToGDVillages">
            <span role="img" aria-label="gdVillages">🏠</span> 全粵村情
          </li>
          <li @click="goToSpoken">
            <span role="img" aria-label="spoken">💬</span> 陽春口語詞
          </li>
          <li @click="goToSource">
            <span role="img" aria-label="source">📚</span> 資料來源
          </li>
          <li @click="goToPrivacyPolicy">
            <span role="img" aria-label="privacy-policy">🔐</span> 隱私政策
          </li>
        </ul>

        <!-- 访问统计区域 -->
        <div class="visit-stats">
          <div class="stats-summary">
            <div class="stat-item">
              <span class="stat-label">今日</span>
              <span class="stat-value">{{ todayVisits }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">總訪問</span>
              <span class="stat-value">{{ totalVisits }}</span>
            </div>
            <button class="expand-btn" @click="toggleStatsPanel">
              📊
            </button>
          </div>
        </div>

        <div class="icp-number">粤ICP备2025466875号-1</div>
      </div>
    </div>
  </Transition>

  <!-- 访问历史弹窗 -->
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="isStatsExpanded" class="glass-modal-overlay" @click.self="closeStatsPanel">
        <div class="glass-card stats-modal-card">
          <button class="close-btn" @click="closeStatsPanel">&times;</button>
          <h3 class="modal-title">📊 訪問統計歷史</h3>

          <div v-if="loadingStats" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加載中...</p>
          </div>

          <div v-else class="stats-content">
            <div class="stats-summary-large">
              <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                  <span class="stat-label-large">今日訪問</span>
                  <span class="stat-value-large">{{ todayVisits }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🌐</div>
                <div class="stat-info">
                  <span class="stat-label-large">總訪問</span>
                  <span class="stat-value-large">{{ totalVisits }}</span>
                </div>
              </div>
            </div>

            <div class="history-section">
              <h4 class="section-title">歷史記錄（最近60天）</h4>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {api, clearToken, getToken} from '@/utils/auth.js';
import {userStore} from "@/utils/store.js";

const router = useRouter();
const props = defineProps({
  isOpen: Boolean
});
const user = ref({}) // 存储用户信息
const mode = ref('login') // 存储登录状态
const emit = defineEmits(['close']);

// 访问统计相关
const todayVisits = ref(0);
const totalVisits = ref(0);
const isStatsExpanded = ref(false);
const visitHistory = ref([]);
const loadingStats = ref(false);

// 导航方法
const closeSidebar = () => {
  emit('close');
};

const goToQuery = () => {
  router.push({ path: '/menu', query: { tab: 'query' } });
  closeSidebar();
};

const goToOldWebsite = () => {
  window.location.href = window.WEB_BASE + '/detail/';
  closeSidebar();
};

const goToGDVillages = () => {
  router.push({ path: '/menu', query: { tab: 'gdVillages' } });
  closeSidebar();
};

const goToSpoken = () => {
  router.push({ path: '/menu', query: { tab: 'ycSpoken' } });
  closeSidebar();
};

const goToSource = () => {
  router.push({ path: '/menu', query: { tab: 'source' } });
  closeSidebar();
};

const goToPrivacyPolicy = () => {
  router.push({ path: '/menu', query: { tab: 'privacy' } });
  closeSidebar();
};
const goToTools = () => {router.push({ path: '/menu',
  query: { tab: 'tools'}})  /* 跳转到工具页面 */
  closeSidebar();}

const goToZhongGu = () =>  {router.push({ path: '/menu',
  query: { tab: 'ZhongGu'}}) /* 跳转到陽春口語詞页面 */
  closeSidebar();}

// 获取访问统计数据
async function fetchVisitStats() {
  try {
    const [todayData, totalData] = await Promise.all([
      api('/logs/visits/today'),
      api('/logs/visits/total')
    ]);

    todayVisits.value = todayData?.today_visits || 0;
    totalVisits.value = totalData?.total_visits || 0;
  } catch (error) {
    console.error('获取访问统计失败:', error);
  }
}

// 切换统计面板展开/收起
async function toggleStatsPanel() {
  isStatsExpanded.value = !isStatsExpanded.value;

  if (isStatsExpanded.value && visitHistory.value.length === 0) {
    await fetchVisitHistory();
  }
}

// 关闭统计面板
function closeStatsPanel() {
  isStatsExpanded.value = false;
}

// 获取访问历史
async function fetchVisitHistory() {
  loadingStats.value = true;
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 60);
    const endDate = today;

    const start_date = startDate.toISOString().split('T')[0];
    const end_date = endDate.toISOString().split('T')[0];

    const data = await api(`/logs/visits/history?start_date=${start_date}&end_date=${end_date}&limit=9999`);

    const dateMap = new Map();
    data?.data?.forEach(item => {
      const date = item.date;
      if (!dateMap.has(date)) {
        dateMap.set(date, 0);
      }
      dateMap.set(date, dateMap.get(date) + item.count);
    });

    visitHistory.value = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('获取访问历史失败:', error);
  } finally {
    loadingStats.value = false;
  }
}
async function initUserByToken({ console_log = false } = {}) {
  const token = getToken();

  // 默认未登录态
  userStore.id = null;
  userStore.username = null;
  userStore.role = 'anonymous';
  userStore.isAuthenticated = false;
  user.value = {}
  mode.value = "login"

  if (!token) {
    console.log("anonymous")
    return {
      user: null,
      role: "anonymous"
    }
  }

  try {
    const res = await api('/auth/me')
    // console.log(res)
    if (!res) {
      userStore.role = 'anonymous';
      return {
        user: null,
        role: "anonymous"
      }
    }

    userStore.id = res.id;
    userStore.username = res.username;
    userStore.role = res?.role === "admin" ? "admin" : "user";
    userStore.isAuthenticated = true;
    user.value = res || {}
    mode.value = "normal"

    if (console_log) {
      console.log("✅ 用户信息已初始化", res)
    }
    // console.log(res)
    return {
      user: res,
      role: userStore.role
    }

  } catch (err) {
    if (console_log) {
      console.error("❌ 用户初始化失败，token 已失效", err)
    }

    clearToken()
    userStore.id = null;
    userStore.username = null;
    userStore.role = "anonymous";
    userStore.isAuthenticated = false;
    user.value = {}
    mode.value = "login"

    return {
      user: null,
      role: "anonymous"
    }
  }
}

onMounted(async () => {
  await initUserByToken();
  await fetchVisitStats();
});
</script>

<style scoped>
/* 遮罩层样式 */
.overlay {
  position: fixed;
  top: 0;
  left: min(40dvw + 40px, 340px);
  width: calc(100dvw - min(40dvw + 40px, 340px));
  height: 100dvh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* 左侧边栏样式 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 40dvw;
  max-width: 300px;
  height: 100dvh;
  box-shadow: inset 0 0 0.5px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 0.5px rgba(255, 255, 255, 0.1);

  background:
    radial-gradient(1200px 800px at 10% -10%, rgba(223, 241, 255, 0.5) 0%, rgba(223, 241, 255, 0) 60%),
    radial-gradient(1000px 700px at 110% 10%, rgba(207, 231, 255, 0.5) 0%, rgba(207, 231, 255, 0) 60%),
    linear-gradient(180deg, rgba(234, 245, 255, 0.7), rgba(215, 236, 255, 0.7));

  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 20px 40px;
}

/* 标题区域 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.title-img {
  height: 8dvh;
  max-height: 60px;
  object-fit: contain;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-grow: 1;
  overflow: auto;
}

.sidebar-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

@media (max-aspect-ratio: 1/1) {
  .sidebar-content {
    gap: 15px;
  }
  .sidebar-content ul {
    gap: 10px;
  }
  .title-img {
    height: 6dvh;
    max-height: 50px;
  }
}

.sidebar-content li {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  color: #005fd3;
  font-weight: 1000;
  border-radius: 25px;
  padding: 6px 15px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 3px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
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
  gap: 1px;
  cursor: pointer;
  user-select: none;
  background: rgba(255, 255, 255, 0.7);
}

.sidebar-content li:hover {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3));
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  margin: 0;
  transform: scale(1.1);
}

/* 访问统计样式 */
.visit-stats {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 15px;
}

.stats-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 15px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15));
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.4);
  gap: 10px;
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

.expand-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #005fd3;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.expand-btn:hover {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4));
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icp-number {
  text-align: center;
  font-size: 14px;
  color: #575757;
}

/* 弹窗样式 (复用 NavBar 的样式) */
.stats-modal-card {
  max-width: 700px;
  width: 90%;
  max-height: 80dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px;
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
  to {
    transform: rotate(360deg);
  }
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

@media (max-aspect-ratio: 1/1) {
  .sidebar-content li {
    font-size: 1.1rem;
  }
}
</style>

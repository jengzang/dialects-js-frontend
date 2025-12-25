<template>
  <div class="navbar">
    <!-- 桌面端的布局 -->
    <div class="navbar-desktop">
      <div class="navbar-item logo-and-title" :style="{ zIndex: isSidebarVisible ? '1100' : '999' }">
        <div class="logo-container" @click="toggleSidebar">
          <img class="logo" src="@/assets/favicon.ico" alt="Logo" />
        </div>
        <div class="title">
          <img src="@/assets/title.png" alt="Title" />
        </div>
      </div>
      <nav class="navbar-btn">
        <RouterLink
            v-for="t in tabs"
            :key="t.tab"
            :to="{ path: '/menu', query: { tab: t.tab } }"
            custom
            v-slot="{ href, navigate, isActive }"
        >
          <a
              :href="href"
              class="menu-item"
              :class="[{ active: isActiveComputed(t.tab, isActive) }, { small: t.tab === 'about' }]"
              :style="{ flex: t.weight + ' 1 0', fontSize: t.fontSize + 'rem' }"
          @click.prevent="onClick(t.tab, navigate)"
          >
          <span class="emoji">{{ t.icon }}</span>
          <span class="label">{{ t.label }}</span>
          </a>
        </RouterLink>
      </nav>
      <div class="logo-container" style="color: #005fd3;border-radius: 30px" @click="goToAuthPage">
        <!-- 显示用户名或"登录" -->
        <span class="login-text">
          {{ user.username ? user.username : '登錄' }}
        </span>
      </div>
    </div>

    <!-- 左侧边栏 -->
    <div class="sidebar" v-if="isSidebarVisible">
      <div class="sidebar-content">
        <ul>
          <li @click="goToOldWebsite">
            <span role="img" aria-label="old-website">🕰️</span> 舊版網站
          </li>
          <li @click="refreshPage">
            <span role="img" aria-label="refresh">🔄</span> 刷新
          </li>
          <li @click="goToSettings">
            <span role="img" aria-label="settings">⚙️</span> 設置
          </li>
          <li @click="goToSuggestions">
            <span role="img" aria-label="suggestions">💡</span> 提出建議
          </li>
          <li @click="goToFavoriteAuthors">
            <span role="img" aria-label="favorite-authors">❤️</span> 喜歡作者
          </li>
          <li @click="goToSource">
            <span role="img" aria-label="source">📚</span> 資料來源
          </li>
          <li @click="goToPrivacyPolicy">
            <span role="img" aria-label="privacy-policy">🔐</span> 隱私政策
          </li>

        </ul>
        <div class="icp-number">粤ICP备2025466875号-1</div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div class="overlay" v-if="isSidebarVisible" @click="toggleSidebar"></div>

    <div class="navbar-content">
      <!-- 第一行: Logo、标题和登录按钮 -->
      <div class="navbar-top">
        <div class="navbar-item logo-and-title" :style="{ zIndex: isSidebarVisible ? '1100' : '999' }">
          <div class="logo-container" style="width: 6dvh" @click="toggleSidebar">
            <img class="logo" src="@/assets/favicon.ico" alt="Logo" />
          </div>
          <div class="title">
            <img src="@/assets/title.png" alt="Title" />
          </div>
        </div>
        <div class="logo-container" style="color: #005fd3; border-radius: 30px;height: 5dvh" @click="goToAuthPage">
          <!-- 显示用户名或"登录" -->
          <span class="login-text">
            {{ user.username ? user.username : '登錄' }}
          </span>
        </div>
      </div>

      <!-- 第二行: 导航按钮 -->
      <div class="navbar-bottom">
        <RouterLink
            v-for="t in tabs"
            :key="t.tab"
            :to="{ path: '/menu', query: { tab: t.tab } }"
            custom
            v-slot="{ href, navigate, isActive }"
        >
          <a
              :href="href"
              class="menu-item"
              :class="[{ active: isActiveComputed(t.tab, isActive) }, { small: t.tab === 'about' }]"
              :style="{ flex: t.weight + ' 1 0', fontSize: t.fontSize === 1 ? '1.5rem' : t.fontSize + 'rem' }"
              @click.prevent="onClick(t.tab, navigate)"
          >
            <!-- 如果 tab 为 "about"，仅显示 emoji，否则显示标签和 emoji -->
            <span class="emoji">{{ t.icon === '🌐' ? '🌐' : t.icon }}</span>
            <span class="label" v-if="t.tab !== 'about'">{{ t.label }}</span>
          </a>
        </RouterLink>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref , onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {api, clearToken,} from '../utils/auth.js' // ✅ 引入工具方法
const route = useRoute()
const router = useRouter()
const user = ref({}) // 存储用户信息
const mode = ref('login') // 存储登录状态
const isSidebarVisible = ref(false)  // 控制边栏显示

// 更新tabs，增加 "结果" 页面并控制字体大小
const tabs = [
  { tab: 'about', label: '關於網站', icon: '🌐', weight: 0.6, fontSize: 1 },
  { tab: 'query', label: '查詢', icon: '📊', weight: 1, fontSize: 1.3 },
  { tab: 'result', label: '結果', icon: '📈', weight: 1, fontSize: 1.3 },
  { tab: 'map', label: '地圖', icon: '🗺️', weight: 1, fontSize: 1.3 },
]

// 根据当前 query.tab 判断
const currentTab = () => route.query.tab || 'query'
const isActiveComputed = (tabName) => route.path === '/menu' && currentTab() === tabName

const onClick = async (tabName, navigate) => {
  if (route.path === '/menu' && currentTab() === tabName) return
  await router.replace({ path: '/menu', query: { tab: tabName } })
}
// goToAuthPage 方法，点击登录按钮后跳转到 /auth 页面
const goToAuthPage = () => {
  router.push('/auth')
}

async function initUserByToken({ console_log = false } = {}) {
  const token = localStorage.getItem("ACCESS_TOKEN")

  // 默认未登录态
  window.currentUser = null
  window.userRole = "anonymous"
  user.value = {}
  mode.value = "login"

  if (!token) {
    return {
      user: null,
      role: "anonymous"
    }
  }

  try {
    const res = await api('/auth/me')

    if (!res.ok) {
      throw new Error("/auth/me 非 200")
    }
    const userData = await res.json()

    // —— 统一状态写入 ——
    window.currentUser = userData
    user.value = userData || {}
    mode.value = "normal"

    const role = userData?.role === "admin" ? "admin" : "user"
    window.userRole = role

    if (console_log) {
      console.log("✅ 用户信息已初始化", userData)
    }

    return {
      user: userData,
      role
    }

  } catch (err) {
    if (console_log) {
      console.error("❌ 用户初始化失败，token 已失效", err)
    }

    clearToken()
    window.currentUser = null
    window.userRole = "anonymous"
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
})


// 切换左侧边栏的显示与隐藏
const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
}

// 按钮点击处理
const goToOldWebsite = () => {  window.location.href = window.WEB_BASE + '/detail/'/* 跳转到旧版网站 */
toggleSidebar()}
const refreshPage = () => {
  // 重新加載所有的 CSS
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  styles.forEach(style => {
    if (style.href) {
      const newStyle = style.cloneNode();
      // 添加時間戳避免緩存
      newStyle.href = `${style.href.split('?')[0]}?t=${new Date().getTime()}`;
      style.parentNode.replaceChild(newStyle, style);
    }
  });
  // 重新加載所有的 JS
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  scripts.forEach(script => {
    if (script.src) {
      const newScript = script.cloneNode();
      // 添加時間戳避免緩存
      newScript.src = `${script.src.split('?')[0]}?t=${new Date().getTime()}`;
      script.parentNode.replaceChild(newScript, script);
    }
  });
  toggleSidebar();
}
const goToSettings = () => {router.push({ path: '/menu',
  query: { tab: 'setting'}})  /* 跳转到设置页面 */
  toggleSidebar(); }
const goToSuggestions = () => {router.push({ path: '/menu',
  query: { tab: 'about', sub: 'suggestion' }}) /* 跳转到喜欢作者页面 */
  toggleSidebar(); /* 跳转到提出建议页面 */ }
const goToFavoriteAuthors = () => {router.push({ path: '/menu',
  query: { tab: 'about', sub: 'like' }}) /* 跳转到喜欢作者页面 */
toggleSidebar();}
const goToSource = () => {router.push({ path: '/menu',
  query: { tab: 'source'}}) /* 跳转到资料来源页面 */
  toggleSidebar(); }
const goToPrivacyPolicy = () =>  {router.push({ path: '/menu',
  query: { tab: 'privacy'}}) /* 跳转到隐私政策页面 */
  toggleSidebar(); }
</script>


<style scoped>
/* 父容器，標題欄背景 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;

  box-shadow: inset 0 0 0.5px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 0.5px rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.35);
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
  max-width: 800px;
  justify-content: center;
  align-items: center;
  display: flex;
  height: 10dvh; /* 使其撑满父容器的高度 */
}

.navbar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
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
}

.ico img {
  padding: 0;
}

/* 圆形logo背景 */
.logo-container {
  width: 6dvh; /* 宽度可以调整 */
  max-width: 15dvh;
  min-width: 6dvh;
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
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)); /* 柔和透明的漸變 */
  color: darkblue;
  font-weight: 1000;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.08); /* 輕微陰影，玻璃感 */
  border: 3px solid rgba(255, 255, 255, 0.4); /* 半透明邊框 */
  transition: all 0.3s ease;
}

.logo {
  width: 90%; /* 控制logo图片的大小 */
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
  transform: translateY(-1px);
  margin: 15px;
  height: 90%;
  color: #007aff;
}

.menu-item.active {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)); /* 柔和透明的漸變 */
  color: darkblue;
  font-weight: 1000;
  border-radius: 0 0 25px 25px; /* 圓角邊框 */
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.08); /* 輕微陰影，玻璃感 */
  border: 3px solid rgba(255, 255, 255, 0.4); /* 半透明邊框 */
  transition: all 0.3s ease;
}

.menu-item.active:hover {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3)); /* 柔和透明的漸變 */
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2); /* 鼠標懸停時增強陰影 */
  margin:0;
}

.login-text {
  display: block;
  max-width: 100px;  /* 根据需要调整最大宽度 */
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
  position: relative; /* 设置父容器的定位属性 */
  gap:0.5dvh;
}

/* 第一行: Logo、标题和登录按钮 */
.navbar-top {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  height: 10dvh;
  width: 100%;
  position: relative; /* 为 .navbar-top 设置定位属性 */
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
  max-width: 100px; /* 根据需要调整最大宽度 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 第二行: 导航按钮 */
.navbar-bottom {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  width:100%;
  height: 6dvh;
}



@media (orientation: portrait) {
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
      radial-gradient(1200px 800px at 10% -10%, rgba(223, 241, 255, 0.5) 0%, rgba(223, 241, 255, 0) 60%), /* 半透明 */
      radial-gradient(1000px 700px at 110% 10%, rgba(207, 231, 255, 0.5) 0%, rgba(207, 231, 255, 0) 60%), /* 半透明 */
      linear-gradient(180deg, rgba(234, 245, 255, 0.7), rgba(215, 236, 255, 0.7)); /* 半透明 */

  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 保证内容和底部对齐 */
  gap: 20px;
  /* 给底部留出空间 */
  padding: 20px 20px 40px;
}

/* 内容部分居中显示 */
.sidebar-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; /* 水平居中 */
  justify-items: center;
  gap: 20px;
  flex-grow: 1;
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

.sidebar-content li {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)); /* 柔和透明的漸變 */
  color:  #005fd3;
  font-weight: 1000;
  border-radius: 25px; /* 圓角邊框 */
  padding: 10px 20px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.08); /* 輕微陰影，玻璃感 */
  border: 3px solid rgba(255, 255, 255, 0.4); /* 半透明邊框 */
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
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3)); /* 柔和透明的漸變 */
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2); /* 鼠標懸停時增強陰影 */
  margin:0;
  transform: scale(1.1);
}

.icp-number {
  text-align: center;
  font-size: 14px;
  color: #575757;
}

/* 遮罩层样式 */
.overlay {
  position: fixed;
  top: 0;
  left: min(40dvw + 40px,340px);
  width: calc(100dvw - min(40dvw + 40px,340px));
  height: 100dvh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* 响应式样式，移动端显示边栏 */
@media (orientation: portrait) {
  .navbar-desktop {
    display: none;
  }
  .navbar-content {
    display: flex;
  }
}

</style>

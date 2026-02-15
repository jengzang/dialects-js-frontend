<template>
  <div >
    <div v-if="isInitLoading" style="padding: 40px; text-align: center;">
      <div class="login-spinner" style="width: 40px; height: 40px; border-width: 4px; margin: 0 auto 20px;"></div>
      <p style="color: #666;">正在同步數據...</p>
    </div>

    <div v-else style="min-height: 80dvh;align-items: center;display: flex">
      <!-- 登錄介面 -->
      <div v-if="mode === 'login'" style="padding: 12px; text-align: center;">
        <h3 style="display: flex; align-items: center; gap: 8px; justify-content: center;">
          登錄
          <button
              class="benefit-circle-btn"
              @click="showBenefitsPopup"
              title="查看會員權益對比"
          >
            🎁
          </button>
        </h3>

        <!-- Tab 切換 -->
        <div class="login-tabs">
          <button
              @click="loginMode = 'email'"
              :class="{ active: loginMode === 'email' }"
          >📧 使用郵箱
          </button>

          <button
              @click="loginMode = 'username'"
              :class="{ active: loginMode === 'username' }"
          >👤 使用用戶名
          </button>
        </div>

        <!-- 郵箱登入 -->
        <div v-if="loginMode === 'email'">
          <div class="form-row" style="display: flex; justify-content: center;">
            <input
                v-model="email"
                placeholder="郵箱"
                style="padding-right: 2em;"
            />
            <span
                style="
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: transparent;
                    font-size: 16px;
                    pointer-events: none;
                  "
            >📧</span>
          </div>
          <div class="form-row" style="display: flex; justify-content: center;position: relative">
            <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="密碼"
                style="padding-right: 2em;"
            />
            <span
                @click="showPassword = !showPassword"
                style="
                    position: absolute;
                    right: 15px;  /* 🎯 調整這個來精準對齊 input 內右邊 */
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    user-select: none;
                    font-size: 16px;
                  ">
                  {{ showPassword ? '👁️' : '🙈' }}
                </span>
          </div>
        </div>

        <!-- 用戶名登入 -->
        <div v-else>
          <div class="form-row" style="display: flex; justify-content: center;">
            <input
                v-model="username"
                placeholder="用戶名"
                style="padding-right: 2em;"
            />
            <span
                style="
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: transparent;
                    font-size: 16px;
                    pointer-events: none;
                  "
            >👤</span>
          </div>
          <div class="form-row" style="display: flex; justify-content: center; position: relative;">
            <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="密碼"
                style="padding-right: 2em;"
            />
            <span
                @click="showPassword = !showPassword"
                style="
                            position: absolute;
                            right: 15px;  /* 🎯 調整這個來精準對齊 input 內右邊 */
                            top: 50%;
                            transform: translateY(-50%);
                            cursor: pointer;
                            user-select: none;
                            font-size: 16px;
                          ">
                          {{ showPassword ? '👁️' : '🙈' }}
                    </span>
          </div>
        </div>

        <div class="form-row" style="display: flex; justify-content: center;">
          <button class="btn-search" @click="login" :disabled="loading">
            <span v-if="loading" class="login-spinner"></span>
            <span v-else>登入</span>
          </button>
        </div>
        <p v-if="error" class="err" v-html="error"></p>
        <p v-if="success" class="success" v-html="success"></p>
        <p><a href="#" @click.prevent="mode='register'">沒有帳號？註冊一個</a></p>
      </div>

      <!-- 註冊介面 -->
      <div v-else-if="mode === 'register'" style="padding: 12px; text-align: center;">
        <h3 style="display: flex; align-items: center; gap: 8px; justify-content: center;">
          註冊
          <button
              class="benefit-circle-btn"
              @click="showBenefitsPopup"
              title="查看會員權益對比"
          >
            🎁
          </button>
        </h3>
        <div class="form-row" style="display: flex; justify-content: center;">
          <input
              v-model="username"
              placeholder="用戶名"
              style="padding-right: 2em;"
          />
          <span
              style="
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: transparent;
                    font-size: 16px;
                    pointer-events: none;
                  "
          >👤</span>
        </div>
        <div class="form-row" style="display: flex; justify-content: center;">
          <input
              v-model="email"
              placeholder="郵箱"
              style="padding-right: 2em;"
          />
          <span
              style="
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: transparent;
                    font-size: 16px;
                    pointer-events: none;
                  "
          >📧</span>
        </div>
        <div class="form-row" style="display: flex; justify-content: center; position: relative;">
          <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="密碼"
              style="padding-right: 2em;"
          />
          <span
              @click="showPassword = !showPassword"
              style="
                    position: absolute;
                    right: 15px;  /* 🎯 調整這個來精準對齊 input 內右邊 */
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    user-select: none;
                    font-size: 16px;
                  ">
                  {{ showPassword ? '👁️' : '🙈' }}
                </span>
        </div>
        <div class="form-row" style="display: flex; justify-content: center; position: relative;">
          <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="確認密碼"
              style="padding-right: 2em;"
          />
          <span
              @click="showPassword = !showPassword"
              style="
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    user-select: none;
                    font-size: 16px;
                  ">
                  {{ showPassword ? '👁️' : '🙈' }}
                </span>
        </div>
        <div class="form-row" style="display: flex; justify-content: center;">
          <button class="btn-search" @click="register" :disabled="loading">註冊</button>
        </div>
        <p v-if="error" class="err" v-html="error"></p>
        <p v-if="success" class="success" v-html="success"></p>
        <p><a href="#" @click.prevent="mode='login'">已有帳號？登錄</a></p>
      </div>

      <!-- 🎉 Profile 歡迎界面 -->
      <div
          v-if="mode === 'profile' && user"
          style="text-align: center"
      >
        <!-- Welcome Header -->
        <h3 id="login-title" style="font-size: 30px; white-space: nowrap">👋{{ user.username }} 歡迎回來✨</h3>

        <!-- Tab 切換按鈕 -->
        <div style="display: flex; align-items: center; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <div class="profile-tabs">
            <button
              @click="switchTab('overview')"
              :class="{ active: currentTab === 'overview' }"
            >
              📊 個人信息
            </button>
            <button
              @click="switchTab('leaderboard')"
              :class="{ active: currentTab === 'leaderboard' }"
            >
              🏆 排行榜
            </button>
          </div>

          <button
              class="benefit-circle-btn"
              @click="showBenefitsPopup"
              title="查看會員權益對比"
          >
            🎁
          </button>
        </div>

        <!-- Overview Tab -->
        <div v-if="currentTab === 'overview'">
          <!-- User Info -->
        <div class="profile-user-info">
          <div class="user-info-badge">
            🎖️ 您是本站的第 <span class="user-number">{{ user.id }}</span> 位註冊用戶
          </div>
          <p class="user-info-details" style="margin:2px">🗓️ 註冊時間：{{ fmt(user.created_at) }}</p>
          <p class="user-info-details" style="margin:2px">⏱️ 在線時長：
            {{ formatOnlineTime(user.total_online_seconds) }}</p>
<!--          <div class="user-info-details">-->
<!--            🗓️ {{ fmt(user.created_at) }} · ⏱️ {{ formatOnlineTime(user.total_online_seconds) }}-->
<!--          </div>-->
        </div>

        <!-- Statistics Card -->
        <div class="stats-card">
          <div class="stats-card-header">
            <help-icon content="統計的是網站核心查詢功能，與排行榜中的總查詢次數不同"
                       size="md"
                       fontSize="16px"
                       iconColor="#c7254e"
                       trigger="both">
            </help-icon>
            📊 查詢統計
            <button class="stats-toggle-btn" @click="statsExpanded = !statsExpanded">
              {{ statsExpanded ? '收起' : '展開' }}
              <span class="stats-toggle-icon">{{ statsExpanded ? '▲' : '▼' }}</span>
            </button>
          </div>

          <div class="stats-total">
            總查詢次數
            <span class="stats-total-number">{{ queryStats.total }}</span>
          </div>

          <div v-show="statsExpanded" class="stats-categories">
            <div
              v-for="category in queryStats.categories"
              :key="category.name"
              class="stat-category"
            >
              <div class="stat-category-header">
                <span class="stat-category-icon">{{ category.icon }}</span>
                <span class="stat-category-name">{{ category.name }}</span>
                <span class="stat-category-total">{{ category.total }}</span>
              </div>
              <div class="stat-category-items">
                <div
                  v-for="item in category.items"
                  :key="item.label"
                  class="stat-item"
                >
                  <div class="stat-item-label">{{ item.label }}</div>
                  <div class="stat-item-count">{{ item.count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-action info" @click="goToUserData">📊 個人數據</button>
          <button class="btn-action blue" @click="mode = 'modifyProfile'">🛠 修改資料</button>
          <button class="btn-action danger" @click="logout">🚪 退出登錄</button>
          <button v-if="user?.role === 'admin'" class="btn-action green" @click="goToAdminPanel">
            🧑‍💻 後台管理
          </button>
          <button
            v-if="user?.role === 'admin'"
            class="btn-action yellow"
            @click="goToTableManager"
          >
            📈 表格管理
          </button>
        </div>
        </div>

        <!-- Leaderboard Tab -->
        <div v-if="currentTab === 'leaderboard'">
          <LeaderboardPanel />
        </div>
      </div>

      <!-- 修改资料界面 -->
      <div v-else-if="mode === 'modifyProfile'" style="padding: 12px; text-align: center;">
        <h3>欢迎 {{ user.username }}! 🎉😊</h3> <!-- 欢迎信息，加入 emoji -->

        <!-- Tab 切换部分 -->
        <div class="login-tabs">
          <button
              @click="modeType = 'username'" :disabled="loading"
              :class="{ active: modeType === 'username' }"
          >👤 修改用戶名</button>

          <button
              @click="modeType = 'password'" :disabled="loading"
              :class="{ active: modeType === 'password' }"
          >🔒 修改密碼</button>
        </div>

        <!-- 修改用户名部分 -->
        <div  v-if="modeType === 'username'">
          <div class="form-row" style="display: flex; justify-content: center;">
            <input
                v-model="newUsername"
                :placeholder="'請輸入新用戶名'"
                style="padding-right: 2em;"
            />
            <span
                style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: transparent; font-size: 16px; pointer-events: none;">
                        👤
                      </span>
          </div>
          <div class="form-row" style="display: flex; justify-content: center;">
            <!-- 保存用户名按钮 -->
            <button class="btn-search" @click="saveUsername" :disabled="loading">保存用戶名</button>
          </div>
        </div>

        <!-- 修改密码部分 -->
        <div v-if="modeType === 'password'">
          <!-- 验证原密码 -->
          <div class="form-row" style="display: flex; justify-content: center; position: relative;">
            <input
                v-model="currentPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="請輸入當前密碼"
                style="padding-right: 2em;"
            />
            <span
                @click="showPassword = !showPassword"
                style="
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    user-select: none;
                    font-size: 16px;
                  ">
                  {{ showPassword ? '👁️' : '🙈' }}
                </span>
          </div>

          <!-- 修改密码 -->
          <div class="form-row" style="display: flex; justify-content: center; position: relative;">
            <input
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="請輸入新密碼（至少6個字符）"
                style="padding-right: 2em;"
            />
            <span
                @click="showPassword = !showPassword"
                style="
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    user-select: none;
                    font-size: 16px;
                  ">
                  {{ showPassword ? '👁️' : '🙈' }}
                </span>
          </div>

          <div v-if="modeType === 'password'" class="form-row" style="display: flex; justify-content: center;">
            <!-- 保存密码按钮 -->
            <button class="btn-search" @click="savePassword" :disabled="loading">保存新密碼</button>
          </div>
        </div>

        <p v-if="error" class="err" v-html="error"></p>
        <p v-if="success" class="success" v-html="success"></p>
        <!-- 返回按钮 -->
        <div class="form-row" style="justify-content: center; margin-top: 10px;">
          <button class="btn-search" @click="mode = 'profile'" style="background: darkgoldenrod">返回</button>
        </div>
      </div>
    </div>

    <!-- 用户权益弹窗 -->
    <UserBenefitsPopup
      :visible="showBenefits"
      @close="closeBenefitsPopup"
      @register="handleRegisterFromBenefits"
    />
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch, computed } from 'vue'
import {
  api,
  getToken,
  getRefreshToken,
  saveToken,
  clearToken,
  getUserRole,
  ensureAuthenticated,
  update_userdatas_bytoken
} from '@/api/index.js'
import { userStore } from '../utils/store.js'
import { useRouter, useRoute } from 'vue-router';
import { manualReport } from '../utils/onlineTimeTracker.js'
import { WEB_BASE } from '@/env-config.js'
import { showConfirm } from '../utils/message.js'
import LeaderboardPanel from '@/components/auth/LeaderboardPanel.vue'
import HelpIcon from "@/components/ToastAndHelp/HelpIcon.vue";
import UserBenefitsPopup from '@/components/auth/UserBenefitsPopup.vue'

export default defineComponent({
  name: 'AuthPopup',
  components: {
    HelpIcon,
    LeaderboardPanel,
    UserBenefitsPopup
  },
  setup() {
    const router = useRouter(); // 必须在 setup 内部调用
    const route = useRoute(); // 获取当前路由
    const mode = ref('login') // login | register | profile
    const isInitLoading = ref(false)
    const username = ref('')
    const password = ref('')
    const confirmPassword = ref('') // 确认密码
    const email = ref('')

    const newUsername = ref('');  // 新用户名
    const currentPassword = ref('');  // 当前密码
    const newPassword = ref('');  // 新密码
    const statsExpanded = ref(false); // 統計展開狀態（默認收起）

    const error = ref('')
    const success = ref('')
    const loading = ref(false)
    const user = ref(null)

    const modeType = ref('username'); // 默认显示修改用户名
    const loginMode = ref('email') // 'email' | 'username'
    const showPassword = ref(false)
    const showBenefits = ref(false) // 用户权益弹窗显示状态

    // Tab switching for profile mode
    const currentTab = computed(() => route.query.tab || 'overview')
    const switchTab = (tab) => {
      router.push({ query: { ...route.query, tab } })
    }



    const validateEmail = (email) => {
      // Basic format check
      const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!re.test(email)) {
        return false;
      }

      // Extract domain
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain) {
        return false;
      }

      // Whitelist of common Chinese email domains (50+ domains)
      const allowedDomains = [
        // NetEase (网易)
        '163.com',
        '126.com',
        'yeah.net',
        '188.com',
        'vip.163.com',
        'vip.126.com',

        // Tencent (腾讯)
        'qq.com',
        'foxmail.com',
        'vip.qq.com',

        // Sina (新浪)
        'sina.com',
        'sina.cn',
        'sina.net',
        'vip.sina.com',

        // Sohu (搜狐)
        'sohu.com',
        'sohu.net',

        // Alibaba (阿里)
        'aliyun.com',
        'alibaba-inc.com',

        // Telecom operators (运营商)
        '139.com',      // China Mobile
        '10086.cn',     // China Mobile
        '189.cn',       // China Telecom
        'wo.cn',        // China Unicom
        '10010.com',    // China Unicom

        // Other Chinese providers
        '21cn.com',
        'tom.com',
        '263.net',
        '2980.com',
        '88.com',
        'eyou.com',
        '56.com',
        'x.cn',
        'citiz.net',

        // International - Google
        'gmail.com',

        // International - Microsoft
        'outlook.com',
        'hotmail.com',
        'live.com',
        'msn.com',

        // International - Yahoo
        'yahoo.com',
        'yahoo.com.cn',
        'yahoo.com.hk',
        'yahoo.com.tw',

        // International - Apple
        'icloud.com',
        'me.com',
        'mac.com',

        // International - Other
        'aol.com',
        'protonmail.com',
        'yandex.com',
        'mail.com',
        'zoho.com',
        'gmx.com',
        'tutanota.com'
      ];

      // Wildcard suffixes for educational institutions
      const allowedSuffixes = [
        '.edu.cn',  // Chinese universities (e.g., tsinghua.edu.cn, pku.edu.cn)
        '.edu',     // International universities (e.g., mit.edu, stanford.edu)
      ];

      // Check exact domain match
      if (allowedDomains.includes(domain)) {
        return true;
      }

      // Check wildcard suffix match
      return allowedSuffixes.some(suffix => domain.endsWith(suffix));
    };

    const login = async () => {
      error.value = ''
      success.value = ''

      if (password.value.length < 6) {
        error.value = '密碼不得少於 6 位'
        return
      }

      loading.value = true

      try {
        const form = new URLSearchParams()
        if (loginMode.value === 'email') {
          form.append('username', email.value)
        } else {
          form.append('username', username.value)
        }
        form.append('password', password.value)
        const res = await api('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form,
        })

        // 保存新的三个值
        saveToken(res.access_token, res.refresh_token, res.expires_in)
        await fetchUser()
        await getUserRole();
        // console.log(userStore.role)
        success.value = '✅ 登錄成功<br>即將刷新頁面'
        setTimeout(() => {
          // 刷新页面以确保所有状态正确加载
          window.location.reload()
        }, 1000)
      } catch (e) {
        let msg = '未知錯誤';
        if (typeof e?.message === 'string') {
          try {
            const data = JSON.parse(e.message);
            msg = data?.detail ?? e.message;
          } catch {
            msg = e.message;
          }
        } else if (e && typeof e === 'object' && 'detail' in e) {
          msg = e.detail;
        }
        if (msg.includes('Invalid credentials')) {
          error.value = '用戶名不存在或密碼錯誤！';
        } else {
          error.value = msg;
        }
      } finally {
        loading.value = false
      }
    }

    const register = async () => {
      error.value = ''
      success.value = ''

      // Username length validation
      if (!username.value || username.value.trim().length < 3) {
        error.value = '用戶名長度不得少於 3 個字符'
        return
      }
      if (username.value.trim().length > 50) {
        error.value = '用戶名長度不得超過 50 個字符'
        return
      }

      if (!validateEmail(email.value)) {
        error.value = '請輸入正確的郵箱'
        return
      }
      if (password.value.length < 6) {
        error.value = '密碼不得少於 6 位'
        return
      }

      // 验证两次密码是否一致
      if (password.value !== confirmPassword.value) {
        error.value = '兩次輸入的密碼不一致，請重新輸入'
        return
      }

      loading.value = true

      try {
        const res = await api('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value,
          }),
        })
        success.value = '✅ 註冊成功，請登錄👤<br> ⏳ 兩秒後將自動跳轉到登錄頁面。'

        setTimeout(async () => {
          mode.value = 'login'
          error.value = ''
          success.value = ''
        }, 2000);
      } catch (e) {
        const msg = e.message || ''
        if (msg.includes('Username already exists')) {
          error.value = '該用戶名已被佔用，請更換一個'
        } else if (msg.includes('Email already exists')) {
          error.value = '該郵箱已註冊，可直接登錄'
        } else {
          error.value = msg
        }
      } finally {
        loading.value = false
      }
    }

    const logout = async () => {
      // Show confirmation dialog
      const confirmed = await showConfirm('確定要退出登錄嗎？', {
        title: '退出確認',
        confirmText: '退出',
        cancelText: '取消'
      });

      // If user cancels, return early
      if (!confirmed) {
        return;
      }

      console.log('🚪 [登出] 用户登出，先上报在线时长');

      // 先上报在线时长
      await manualReport();

      const refreshToken = getRefreshToken()

      try {
        await api('/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { refresh_token: refreshToken }
        })
      } catch {}

      clearToken()
      userStore.role = 'anonymous';
      userStore.isAuthenticated = false;

      console.log('✅ [登出] 登出完成');

      // 刷新页面以确保所有状态正确清除
      setTimeout(() => {
        window.location.reload()
      }, 500);
    }


    const fetchUser = async () => {
      isInitLoading.value = true;
      try {
        const res = await api('/auth/me')
        // 直接更新全局 store
        userStore.id = res.id
        userStore.username = res.username
        userStore.role = res.role
        userStore.isAuthenticated = true

        // 让本地 user 引用 store 里的数据
        user.value = res
        isInitLoading.value = false;
      } catch (e) {
        clearToken()
        userStore.isAuthenticated = false
        userStore.role = 'anonymous'
        mode.value = 'login'
        isInitLoading.value = false;
      }
    }

    const saveUsername = async () => {
      error.value = ''
      success.value = ''

      if (!newUsername.value) {
        error.value = '請輸入新的用戶名'
        return
      }

      // 确认对话框
      const confirmed = await showConfirm(`確定要將用戶名修改為「${newUsername.value}」嗎？`, {
        title: '修改用戶名',
        confirmText: '確定修改',
        cancelText: '取消'
      });

      if (!confirmed) {
        return;
      }

      loading.value = true

      try {
        const form = new URLSearchParams();
        form.append('username', newUsername.value);
        form.append('email', user.value.email);

        const res = await api('/auth/updateProfile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form,
        })

        success.value = '✅ 用戶名更新成功！<br>👤 您需重新登錄<br>⏳ 兩秒後將自動跳轉到登錄頁面。'

        setTimeout(async () => {
          mode.value = 'profile';
          await fetchUser();
          error.value = ''
          success.value = ''
        }, 2000);
      } catch (e) {
        try {
          const errorDetails = JSON.parse(e.message);
          if (errorDetails.detail) {
            error.value = `❌ 錯誤：${errorDetails.detail}`;
          } else {
            error.value = '發生未知錯誤';
          }
        } catch (jsonError) {
          error.value = '發生錯誤，無法解析響應';
        }
      } finally {
        loading.value = false
      }
    }

    const savePassword = async () => {
      error.value = ''
      success.value = ''

      if (!currentPassword.value) {
        error.value = '請輸入當前密碼'
        return
      }

      if (!newPassword.value || newPassword.value.length < 6) {
        error.value = '新密碼必須至少6個字符'
        return
      }

      // 确认对话框
      const confirmed = await showConfirm('確定要修改密碼嗎？', {
        title: '修改密碼',
        confirmText: '確定修改',
        cancelText: '取消'
      });

      if (!confirmed) {
        return;
      }

      loading.value = true

      try {
        const form = new URLSearchParams();
        form.append('password', currentPassword.value);
        form.append('new_password', newPassword.value);
        form.append('email', user.value.email);

        const res = await api('/auth/updateProfile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form,
        })

        success.value = '✅ 密碼更新成功！<br>👤 ⏳ 兩秒後將自動跳轉到個人資料頁面。'

        setTimeout(async () => {
          mode.value = 'profile';
          await fetchUser();
          error.value = ''
          success.value = ''
        }, 2000);
      } catch (e) {
        try {
          const errorDetails = JSON.parse(e.message);
          if (errorDetails.detail) {
            error.value = `❌ 錯誤：${errorDetails.detail}`;
          } else {
            error.value = '發生未知錯誤';
          }
        } catch (jsonError) {
          error.value = '發生錯誤，無法解析響應';
        }
      } finally {
        loading.value = false
      }
    }

    const queryStats = computed(() => {
      const stats = user.value?.usage_summary || []

      // 定義分類結構
      const categoryMap = {
        '音韻查詢': {
          icon: '🔍',
          paths: {
            '/api/ZhongGu': '查中古',
            '/api/YinWei': '查音位',
            '/api/phonology': '查地位',
            '/api/feature_stats': '查音節',
          }
        },
        '字調查詢': {
          icon: '📝',
          paths: {
            '/api/search_chars/': '查字',
            '/api/search_tones/': '查調',
          }
        },
        '音系分析': {
          icon: '📊',
          paths: {
            '/api/phonology_matrix': '查音系',
            '/api/phonology_classification_matrix': '查音素',
            '/api/feature_counts': '音節統計',
          }
        },
        '工具使用': {
          icon: '🛠️',
          paths: {
            '/api/tools/check/analyze': '字表檢查',
            '/api/tools/jyut2ipa/upload': '粵拼轉換',
            '/api/tools/merge/execute': '合併字表',
            '/api/tools/praat/jobs': '聲學分析',
          }
        }
      }

      let total = 0
      const categoryCounts = {}

      // 初始化分類計數
      Object.keys(categoryMap).forEach(categoryName => {
        categoryCounts[categoryName] = {}
      })

      // 統計每個 API 的調用次數
      stats.forEach(stat => {
        // 找到這個 path 屬於哪個分類
        for (const [categoryName, categoryData] of Object.entries(categoryMap)) {
          if (categoryData.paths[stat.path]) {
            const label = categoryData.paths[stat.path]
            total += stat.count

            if (categoryCounts[categoryName][label]) {
              categoryCounts[categoryName][label] += stat.count
            } else {
              categoryCounts[categoryName][label] = stat.count
            }
            break
          }
        }
      })

      // 構建分類數據結構
      const categories = Object.entries(categoryMap).map(([categoryName, categoryData]) => {
        const items = Object.entries(categoryCounts[categoryName]).map(([label, count]) => ({
          label,
          count
        }))

        const categoryTotal = items.reduce((sum, item) => sum + item.count, 0)

        return {
          name: categoryName,
          icon: categoryData.icon,
          total: categoryTotal,
          items
        }
      }).filter(category => category.total > 0) // 只顯示有數據的分類

      return {
        total,
        categories
      }
    })

    onMounted(async () => {
      if (getToken()) {
        await fetchUser()
        if (user.value) {
          mode.value = 'profile'
        }
      }
    })

    const fmt = (isoStr) => {
      const utc = new Date(isoStr)
      const beijing = new Date(utc.getTime() + 8 * 60 * 60 * 1000)
      return beijing.toLocaleString('zh-Hant-CN', { hour12: false })
    }

    const formatOnlineTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '-'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)

      if (hours > 0) {
        return `${hours} 小時 ${minutes} 分鐘`
      }
      return `${minutes} 分鐘 ${secs} 秒`
    }

    const goToAdminPanel = () => {
      window.location.href = WEB_BASE + '/admin';
    };

    const goToTableManager = () => {
      router.push({ path: '/explore', query: { page: 'manage' } });
    };

    const goToUserData = () => {
      router.push({
        path: '/auth/data',
        query: { username: user.value.username }
      });
    };

    watch(mode, () => {
      error.value = ''
      success.value = ''
    })

    const showBenefitsPopup = () => {
      showBenefits.value = true
    }

    const closeBenefitsPopup = () => {
      showBenefits.value = false
    }

    const handleRegisterFromBenefits = () => {
      mode.value = 'register'
      showBenefits.value = false
    }

    return {
      username, password, confirmPassword, email, error, success, loading, savePassword, saveUsername, modeType,
      user, mode, login, register, logout, fmt, loginMode,
      newPassword, newUsername, currentPassword, formatOnlineTime,
      showPassword, queryStats, goToAdminPanel, goToTableManager, goToUserData, isInitLoading, statsExpanded,
      currentTab, switchTab, // 添加 tab 切换相关
      showBenefits, showBenefitsPopup, closeBenefitsPopup, handleRegisterFromBenefits // 用户权益弹窗相关
    }
  }
})
</script>

<style scoped>
.query-detail-panel {
  /* ✅ 加这些👇 */
  width: 100%;
  max-width: 480px;       /* 控制在大屏不太宽 */
  margin: 0 auto;         /* 居中显示 */

  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 16px;
  font-size: 16px; /* ✅ 字體統一 */
}

.query-detail-panel.border-breath {
  animation: border-breath 1.5s ease-in-out;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.6);
  border: 2px solid transparent;
  border-radius: 12px;
}

@keyframes border-breath {
  0% { box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.6); }
  50% { box-shadow: 0 0 12px 4px rgba(0, 122, 255, 0.3); }
  100% { box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.6); }
}

.login-tabs {
  display: inline-flex;
  border: 1px solid #d0d0d0;
  border-radius: 12px;
  padding: 4px;
  background-color: #f0f0f5;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.login-tabs button {
  appearance: none;
  background: none;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  color: #333;
  font-weight: 500;
}

.login-tabs button:hover {
  background-color: rgba(0, 122, 255, 0.1); /* 🍏 Hover 藍光 */
}

.login-tabs button.active {
  background-color: white;
  color: #007aff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  font-weight: 600;
}

/* Profile Tabs - Same style as login tabs */
.profile-tabs {
  display: inline-flex;
  border: 1px solid #d0d0d0;
  border-radius: 12px;
  padding: 4px;
  background-color: #f0f0f5;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

.profile-tabs button {
  appearance: none;
  background: none;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  color: #333;
  font-weight: 500;
}

.profile-tabs button:hover {
  background-color: rgba(0, 122, 255, 0.1);
}

.profile-tabs button.active {
  background-color: white;
  color: #007aff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  font-weight: 600;
}


.form-row {
  width: 100%;
  margin: 12px 0;
  display: flex;
  justify-content: center;
  position: relative;
}

.form-row input {
  width: 100%;
  max-width: 320px;
  padding: 14px 16px;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  box-shadow: inset 0 0 1px rgba(255, 255, 255, 0.4),
  0 4px 12px rgba(0, 0, 0, 0.08);
  color: #333;
  outline: none;
  transition: all 0.3s ease;
}

.form-row input::placeholder {
  color: #999;
}

.form-row input:focus {
  box-shadow: 0 0 0 2px #007aff, 0 0 12px rgba(0, 122, 255, 0.2);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  flex-wrap: wrap;
}

.btn-action {
  padding: 14px 18px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 180px;
  justify-content: center;
  margin: 0 auto;
}

.btn-action.blue {
  background-color: #007aff;
}
.btn-action.blue:hover {
  background-color: #005fcc;
}
/* Warning 状态效果 - 深黄色/琥珀色 */
.btn-action.yellow {
  background-color: #f39c12; /* 更深、更饱和的警示黄 */
  color: #ffffff;           /* 颜色加深后，白色文字对比度也足够了 */
}

.btn-action.yellow:hover {
  background-color: #e67e22; /* 悬停时转为深橙色，增强交互感 */
}

.btn-action.green {
  background-color: #28a745;
}
.btn-action.green:hover {
  background-color: #1f8a36;
}

.btn-action.danger {
  background-color: darkred;
}
.btn-action.danger:hover {
  background-color: #a91f1f;
}

.btn-action.info {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.btn-action.info:hover {
  background: linear-gradient(135deg, #5568d3, #5f3d8a);
}

.btn-search {
  background-color: #007aff;
  color: white;
  padding: 12px 24px;
  font-size: 17px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-search:hover:not(:disabled) {
  background-color: #0056b3;
  transform: scale(1.04);
}

.btn-search:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.err {
  color: red;
  margin-top: 10px;
  font-size: 15px;
  font-weight: bold;
}

.success {
  color: #34c759;
  margin-top: 10px;
  font-size: 15px;
  font-weight: bold;
}


.form-row span {
  user-select: none;
}

/* 📱 Mobile: 字體放大、距離拉開、互動更舒適 */
@media (max-aspect-ratio: 1/1) {
  .query-detail-panel {
    font-size: 18px;
    max-width: 350px;       /* 控制在大屏不太宽 */
  }

  .action-buttons{
    flex-direction: column;
  }
  .btn-search {
    width: 100%;
    padding: 16px;
    font-size: 18px;
  }

  .login-tabs {
    flex-direction: column;
    gap: 8px;
  }

  .form-row input {
    font-size: 18px;
    padding: 16px;
  }

  .btn-action {
    font-size: 18px;
    padding: 12px 20px;
  }

  .err {
    font-size: 16px;
  }

  #login-title {
    font-size: 28px!important;
  }

  /* User info responsive */
  .user-info-badge {
    font-size: 16px;
  }

  .user-number {
    font-size: 18px;
  }

  .user-info-details {
    font-size: 14px;
  }

  .stats-card {
    padding: 12px 20px!important;
  }

  .stat-category-items {
    grid-template-columns: 1fr;
  }

  .stat-item {
    padding: 12px;
  }

  .stat-category-header {
    font-size: 14px;
  }

  .stat-category-name {
    font-size: 14px;
  }

  .stat-category-total {
    font-size: 16px;
  }
}

/* 📱 Tablet: 2-column grid for statistics */
@media (max-width: 768px) and (min-width: 481px) {
  .stat-category-items {
    grid-template-columns: repeat(2, 1fr);
  }
}
h3 {
  font-size: 30px;
  font-weight: 700;
  color: #1c1c1e; /* 深灰，符合蘋果系統色調 */
  margin-bottom: 16px;
}
#login-title{
  font-weight: 600;
  margin: 12px;
  transition: all 0.3s ease;
}
#login-title:hover {
  color: #007aff;
  text-shadow: 0 0 8px rgba(0, 122, 255, 0.6);
  transform: scale(1.05);
}

/* User Info Section - Compact Display */
.profile-user-info {
  margin: 10px auto;
  max-width: 600px;
  text-align: center;
}

.user-info-badge {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.user-number {
  color: #007aff;
  font-weight: 700;
  font-size: 20px;
  padding: 0 4px;
}

.user-info-details {
  font-size: 15px;
  color: #707077;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

/* Statistics Card - Apple Liquid Glass Style */
.stats-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  padding: 16px 28px;
  margin: 20px auto;
  max-width: 1000px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  border: 0.5px solid rgba(255, 255, 255, 0.8);
}

.stats-card-header {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 20px;
  text-align: center;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.stats-toggle-btn {
  background: rgba(0, 122, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 0.5px solid rgba(0, 122, 255, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #007aff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-toggle-btn:hover {
  background: rgba(0, 122, 255, 0.15);
  border-color: rgba(0, 122, 255, 0.5);
  transform: translateY(-1px);
}

.stats-toggle-icon {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.stats-total {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(0, 122, 255, 0.05));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #007aff;
  padding: 15px;
  margin-bottom: 8px;
  border-radius: 16px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  box-shadow:
    0 2px 8px rgba(0, 122, 255, 0.12),
    inset 0 0 0 1px rgba(0, 122, 255, 0.2);
  border: 0.5px solid rgba(0, 122, 255, 0.3);
}

.stats-total-number {
  font-size: 42px;
  font-weight: 700;
  display: block;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #007aff, #0051d5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Statistics Categories - Grid Layout */
.stats-categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

/* Portrait mode - 1 column */
@media (orientation: portrait), (max-width: 768px) {
  .stats-categories {
    grid-template-columns: 1fr;
  }
}

.stat-category {
  background: rgba(247, 247, 247, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 12px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  border: 0.5px solid rgba(255, 255, 255, 0.5);
}

.stat-category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-category-icon {
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.stat-category-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
  flex: 1;
}

.stat-category-total {
  font-size: 18px;
  font-weight: 700;
  color: #007aff;
  letter-spacing: -0.02em;
  background: rgba(0, 122, 255, 0.08);
  padding: 4px 12px;
  border-radius: 8px;
}

.stat-category-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  padding: 8px 12px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  border: 0.5px solid rgba(255, 255, 255, 0.6);
  flex: 0 0 80px;
}

/* Portrait mode - slightly wider items */
@media (max-aspect-ratio: 1/1) {
  .stat-item {
    flex: 0 0 90px;
  }
}

.stat-item:hover {
  transform: translateY(-2px) scale(1.03);
  background: rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 12px rgba(0, 122, 255, 0.15),
    inset 0 0 0 1.5px rgba(0, 122, 255, 0.4);
  border-color: rgba(0, 122, 255, 0.5);
}

.stat-item-label {
  font-size: 12px;
  color: #86868b;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.stat-item-count {
  font-size: 22px;
  font-weight: 700;
  color: #007aff;
  letter-spacing: -0.02em;
}
/* 简单的转圈动画 */
.login-spinner {
  border: 3px solid #f3f3f3; /* Light grey */
  border-top: 3px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.benefit-circle-btn {
  /* 布局与尺寸 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;  /* 对应 size="lg" */
  height: 35px;
  padding: 0;

  /* 形状与外观 */
  border-radius: 50%; /* 纯圆 */
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.08); /* 极细的边框 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* 柔和阴影 */

  /* 字体与内容 */
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  /* 防止选中文字 */
  user-select: none;
}

/* 悬停效果 */
.benefit-circle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.15); /* 悬停时带一点点橙色光晕 */
  border-color: rgba(255, 149, 0, 0.3); /* 边框变橙色 */
}

/* 点击按下效果 */
.benefit-circle-btn:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
</style>



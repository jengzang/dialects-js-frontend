<template>
  <div  >
    <!-- 登錄介面 -->
    <div v-if="mode === 'login'" style="padding: 12px; text-align: center;">
      <h3>登錄</h3>

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
        <button class="btn-search" @click="login" :disabled="loading">登入</button>
      </div>
      <p v-if="error" class="err" v-html="error"></p>
      <p><a href="#" @click.prevent="mode='register'">沒有帳號？註冊一個</a></p>
    </div>

    <!-- 註冊介面 -->
    <div v-else-if="mode === 'register'" style="padding: 12px; text-align: center;">
      <h3>註冊</h3>
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
      <div class="form-row" style="display: flex; justify-content: center;">
        <button class="btn-search" @click="register" :disabled="loading">註冊</button>
      </div>
      <p v-if="error" class="err" v-html="error"></p>
      <p><a href="#" @click.prevent="mode='login'">已有帳號？登錄</a></p>
    </div>

    <!-- 🎉 Profile 歡迎彈窗 -->
    <div
        v-if="mode === 'profile' && user"
        style="text-align: center;padding:30px"

    >
      <h3 id="login-title" style="font-size: 30px; white-space: nowrap">👋{{ user.username }} 歡迎回來✨</h3>
      <p id="login-info" style="font-size: 20px">
        {{ user?.role === 'admin' ? '🛡️ 您是管理員' : '👤 您是普通用戶' }}
      </p>
      <p id="login-info" style="font-size: 20px">🗓️ 註冊時間：{{ fmt(user.created_at) }}</p>
      <p id="login-info" style="font-size: 20px">⏱️ 總在線時長：
        {{ formatOnlineTime(user.total_online_seconds) }}</p>
      <p id="login-info" style=" font-size: 20px;">
        📊 總查詢次數：<span style="color: #cd0b0b;margin-bottom: 0;">{{ queryStats.total }}</span> 次
      </p>
      <ul class="api-log-list">
        <li
            v-for="item in queryStats.items"
            :key="item.label"
            class="api-log-item"
        >
          -- {{ item.label }}：{{ item.count }} 次
        </li>
      </ul>
      <!-- Action 按鈕們 -->
      <div class="action-buttons">
        <button class="btn-action danger" @click="logout">🚪 退出登錄</button>

        <button class="btn-action primary" @click="mode = 'modifyProfile'">🛠 修改資料</button>

        <button v-if="user?.role === 'admin'" class="btn-action success" @click="goToAdminPanel">
          🧑‍💻 後台管理
        </button>
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
        <div class="form-row" style="display: flex; justify-content: center;">
          <input
              v-model="currentPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="請輸入當前密碼"
              style="padding-right: 2em;"
          />
        </div>

        <!-- 修改密码 -->
        <div class="form-row" style="display: flex; justify-content: center;">
          <input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="請輸入新密碼（至少6個字符）"
              style="padding-right: 2em;"
          />
        </div>

        <span
            @click="showPassword = !showPassword"
            style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; user-select: none; font-size: 16px;">
                    {{ showPassword ? '👁️' : '🙈' }}
                </span>

        <div v-if="modeType === 'password'" class="form-row" style="display: flex; justify-content: center;">
          <!-- 保存密码按钮 -->
          <button class="btn-search" @click="savePassword" :disabled="loading">保存新密碼</button>
        </div>
      </div>

      <p v-if="error" class="err" v-html="error"></p>
      <!-- 返回按钮 -->
      <div class="form-row" style="justify-content: center; margin-top: 10px;">
        <button class="btn-search" @click="mode = 'profile'" style="background: darkgoldenrod">返回</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, watch, computed } from 'vue'
import {
  api,
  getToken,
  saveToken,
  clearToken,
  getUserRole,
  ensureAuthenticated,
  update_userdatas_bytoken
} from '../utils/auth.js' // ✅ 引入工具方法

export default defineComponent({
  name: 'AuthPopup',
  setup() {
    const mode = ref('login') // login | register | profile
    const username = ref('')
    const password = ref('')
    const email = ref('')

    const newUsername = ref('');  // 新用户名
    const currentPassword = ref('');  // 当前密码
    const newPassword = ref('');  // 新密码

    const error = ref('')
    const loading = ref(false)
    const user = ref(null)

    const modeType = ref('username'); // 默认显示修改用户名
    const loginMode = ref('email') // 'email' | 'username'
    const showPassword = ref(false)


    const validateEmail = (email) => {
      const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return re.test(email);
    };

    const login = async () => {
      error.value = ''

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
        saveToken(res.access_token)
        await fetchUser()
        window.userRole = undefined;
        window.userRole = await getUserRole();
        console.log(userRole)
        error.value = '✅ 登錄成功<br>即將跳轉個人信息界面'
        setTimeout(() => {
          mode.value = 'profile'
          error.value = ''
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

      if (!validateEmail(email.value)) {
        error.value = '請輸入正確的郵箱'
        return
      }
      if (password.value.length < 6) {
        error.value = '密碼不得少於 6 位'
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
        error.value = '✅ 註冊成功，請登錄👤<br> ⏳ 兩秒後將自動跳轉到登錄頁面。'

        setTimeout(async () => {
          mode.value = 'login'
          error.value = ''
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
      try {
        await api('/auth/logout', { method: 'POST' })
      } catch {}
      clearToken()
      window.userRole = undefined;
      setTimeout(async () => {
        mode.value = 'login'
        error.value = ''
      }, 100);
    }

    const fetchUser = async () => {
      try {
        const res = await api('/auth/me')
        user.value = res
        const isLoggedIn = res && res.id && res.username;
      } catch {
        clearToken()
        mode.value = 'login'
      }
    }

    const saveUsername = async () => {
      error.value = ''

      if (!newUsername.value) {
        error.value = '請輸入新的用戶名'
        return
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

        error.value = '✅ 用戶名更新成功！<br>👤 您需重新登錄<br>⏳ 兩秒後將自動跳轉到登錄頁面。'

        setTimeout(async () => {
          mode.value = 'profile';
          await fetchUser();
          error.value = ''
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

      if (!currentPassword.value) {
        error.value = '請輸入當前密碼'
        return
      }

      if (!newPassword.value || newPassword.value.length < 6) {
        error.value = '新密碼必須至少6個字符'
        return
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

        error.value = '✅ 密碼更新成功！<br>👤 ⏳ 兩秒後將自動跳轉到個人資料頁面。'

        setTimeout(async () => {
          mode.value = 'profile';
          await fetchUser();
          error.value = ''
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

      const labelMap = {
        '/api/ZhongGu': '🔍 查中古',   // 新增：也映射为查中古
        '/api/YinWei': '🗣🔍 查音位',    // 新增：查音位
        '/api/phonology': '🔍 查地位', // 修改：原查地位改为查中古
        '/api/search_chars/': '🔤 查字',
        '/api/search_tones/': '🎶 查調',
      }

      let total = 0
      const filtered = stats
          .filter(stat => Object.keys(labelMap).includes(stat.path))
          .map(stat => {
            total += stat.count
            return {
              label: labelMap[stat.path],
              count: stat.count
            }
          })

      return {
        total,
        items: filtered
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
      return `${hours} 小時 ${minutes} 分鐘`
    }

    const goToAdminPanel = () => {
      window.location.href = window.WEB_BASE + '/admin';
    };

    watch(mode, () => {
      error.value = ''
    })

    return {
      username, password, email, error, loading, savePassword, saveUsername, modeType,
      user, mode, login, register, logout, fmt, loginMode,
      newPassword, newUsername, currentPassword, formatOnlineTime,
      showPassword, queryStats, goToAdminPanel
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
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
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
  width: 100%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 180px;
  justify-content: center;
  margin: 0 auto;
}

.btn-action.primary {
  background-color: #007aff;
}
.btn-action.primary:hover {
  background-color: #005fcc;
}

.btn-action.success {
  background-color: #28a745;
}
.btn-action.success:hover {
  background-color: #1f8a36;
}

.btn-action.danger {
  background-color: darkred;
}
.btn-action.danger:hover {
  background-color: #a91f1f;
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
}

.btn-search:hover {
  background-color: #0056b3;
  transform: scale(1.04);
}

.err {
  color: red;
  margin-top: 10px;
  font-size: 15px;
  font-weight: bold;
}

.api-log-list {
  margin: 4px 0 0 16px;
  padding: 0;
}

.api-log-item {
  list-style: none;
  font-size: 15px;
  color: #333;
  padding: 0 8px;
  border-radius: 4px;
  cursor: default;
  transition: background-color 0.2s, color 0.2s;
  margin: 0;
}

.api-log-item:hover {
  background-color: #eaeffd;
  color: #007aff;
  font-weight: bold;
}

.form-row span {
  user-select: none;
}

/* 📱 Mobile: 字體放大、距離拉開、互動更舒適 */
@media (max-width: 480px) {
  .query-detail-panel {
    font-size: 18px;
    max-width: 350px;       /* 控制在大屏不太宽 */
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
    padding: 16px;
  }

  .err {
    font-size: 16px;
  }

  .api-log-item {
    font-size: 16px;
  }
  #login-title {
    font-size: 28px!important;
  }
  #login-info{
    font-size: 18px!important;
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
  margin-bottom: 12px;
  transition: all 0.3s ease;
}
#login-title:hover {
  color: #007aff;
  text-shadow: 0 0 8px rgba(0, 122, 255, 0.6);
  transform: scale(1.05);
}
#login-info{
  margin: 6px 0;
  transition: all 0.3s ease;
}

#login-info:hover{
  transform: translateY(-2px);
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  color: #005fcc;
}
</style>



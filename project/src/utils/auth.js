// utils/auth.js
import { userStore } from './store.js'

export const getToken = () => {
    let token = localStorage.getItem('ACCESS_TOKEN');
    if (!token) {
        token = getCookie('ACCESS_TOKEN');
    }
    return token;
};

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export const saveToken = (token) => {
    localStorage.setItem('ACCESS_TOKEN', token);
    document.cookie = `ACCESS_TOKEN=${token}; path=/; secure; samesite=None`;
};

export const clearToken = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('TOKEN_EXP');
};

/**
 * 增强版 API 函数 - 统一的网络请求接口
 * @param {string} path - API 路径（会自动添加 WEB_BASE 前缀）
 * @param {Object} options - 请求选项
 * @param {string} options.method - HTTP 方法（默认 'GET'）
 * @param {Object} options.headers - 请求头（会自动添加 Authorization 和 Content-Type）
 * @param {any} options.body - 请求体（如果是对象会自动 JSON.stringify）
 * @param {number} options.timeout - 超时时间（ms，默认 30000）
 * @param {boolean} options.showError - 是否自动显示错误提示（默认 true）
 * @returns {Promise<any>} - 解析后的响应数据
 */
export async function api(path, options = {}) {
    const {
        method = 'GET',
        headers = {},
        body = null,
        timeout = 30000,      // 默认30秒超时
        showError = true      // 是否自动显示错误
    } = options;

    const token = getToken();
    const WEB_BASE = window.WEB_BASE || 'http://localhost:5000';

    // 自动添加 Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 自动添加 Content-Type（如果有 body 且未指定）
    if (body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(WEB_BASE + path, {
            method,
            headers,
            body,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 统一错误处理
        if (!res.ok) {
            const text = await res.text();
            const error = new Error(text || `請求失敗：${res.status}`);
            error.status = res.status;
            error.response = res;
            throw error;
        }

        // 自动解析响应
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : res.text();

    } catch (err) {
        // 超时错误处理
        if (err.name === 'AbortError') {
            throw new Error('請求超時，請稍後重試');
        }

        // 401 自动清除 token
        if (err.status === 401) {
            clearToken();
        }

        // 可选：自动显示错误提示（如果项目中有全局提示函数）
        if (showError && typeof window.showErrorToast === 'function') {
            window.showErrorToast(err.message);
        }

        throw err;
    }
}

export async function ensureAuthenticated(e, popup_bool = true) {
    try {
        const res = await api('/auth/me');
        if (res && res.id && res.username) {
            return { id: res.id, username: res.username };
        }
    } catch (err) {
        if (err.status === 401) {
            clearToken();
        }
    }
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (popup_bool && typeof showAuthPopup === 'function') {
        showAuthPopup();
    }
    return false;
}

/**
 * 更新用户数据并同步到 userStore
 * @param {string} token - 访问令牌
 * @param {boolean} console_log - 是否输出日志（默认 false）
 * @returns {Promise<Object|null>} - 用户数据或 null
 */
export async function update_userdatas_bytoken(token, console_log = false) {
    try {
        const userData = await api('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
            showError: false
        });

        if (console_log) {
            console.log('✅ 用户数据已更新:', userData);
        }

        userStore.id = userData.id;
        userStore.username = userData.username;
        userStore.role = userData.role || 'user';
        userStore.isAuthenticated = true;

        return userData;

    } catch (err) {
        console.error("❌ 無法更新用戶資料", err);
        return null;
    }
}


/**
 * 获取用户角色（响应式版本）
 * 会自动更新 userStore，无需轮询
 * @returns {Promise<string>} - 用户角色
 */
export async function getUserRole() {
    if (userStore.role !== 'anonymous') {
        return userStore.role;
    }

    const token = localStorage.getItem("ACCESS_TOKEN");

    if (!token) {
        userStore.role = 'anonymous';
        userStore.isAuthenticated = false;
        return 'anonymous';
    }

    try {
        const user = await update_userdatas_bytoken(token, true);

        if (user && user.role) {
            userStore.role = user.role;
            userStore.isAuthenticated = true;
            return user.role;
        } else {
            userStore.role = 'user';
            userStore.isAuthenticated = true;
            return 'user';
        }
    } catch (err) {
        console.error('❌ 获取用户角色失败:', err);
        userStore.role = 'anonymous';
        userStore.isAuthenticated = false;
        return 'anonymous';
    }
}
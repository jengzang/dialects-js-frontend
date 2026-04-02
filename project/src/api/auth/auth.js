// utils/auth.js
import { userStore } from '../../main/store/store.js'
import { WEB_BASE } from '@/env-config.js'
import { showRateLimitNotice } from '@/utils/rateLimitNotice.js'

const AUTH_API_BASE = '/api/auth'

// ==========================================
// 1. 用户信息缓存管理 (新增)
// ==========================================
const USER_CACHE_KEY = 'user_info_cache';

export const saveUserCache = (userData) => {
    try {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
    } catch (e) {
        console.error('缓存用户信息失败', e);
    }
};

export const getUserCache = () => {
    try {
        const data = localStorage.getItem(USER_CACHE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

export const clearUserCache = () => {
    localStorage.removeItem(USER_CACHE_KEY);
};


// ==========================================
// 2. Token 管理
// ==========================================
export const getToken = () => {
    let token = localStorage.getItem('access_token');
    if (!token) {
        token = getCookie('access_token');
    }
    // 兼容旧版本
    if (!token) {
        token = localStorage.getItem('ACCESS_TOKEN');
    }
    return token;
};

export const getRefreshToken = () => {
    let token = localStorage.getItem('refresh_token');
    if (!token) {
        token = getCookie('refresh_token');
    }
    return token;
};

export const getTokenExpiresAt = () => {
    const expiresAt = localStorage.getItem('token_expires_at');
    return expiresAt ? parseInt(expiresAt) : null;
};

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export const saveToken = (accessToken, refreshToken = null, expiresIn = 1800) => {
    // 计算过期时间戳（当前时间 + expiresIn秒）
    const expiresAt = Date.now() + expiresIn * 1000;

    // ✅ 修改：计算 Cookie 过期时间（与 localStorage 一致）
    const expiresDate = new Date(expiresAt);
    const expiresString = expiresDate.toUTCString();

    // ✅ 修改：根据协议决定是否使用 secure 属性（解决开发环境问题）
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? 'secure; ' : '';

    if (!refreshToken) {
        // 旧版本调用，只传一个参数
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('ACCESS_TOKEN', accessToken);  // 兼容

        // 存储到 Cookie，并设置过期时间
        document.cookie = `access_token=${accessToken}; path=/; ${secureFlag}samesite=Lax; expires=${expiresString}`;
        document.cookie = `ACCESS_TOKEN=${accessToken}; path=/; ${secureFlag}samesite=Lax; expires=${expiresString}`;
        return;
    }

    // 存储 access token
    localStorage.setItem('access_token', accessToken);

    // 存储 refresh token
    localStorage.setItem('refresh_token', refreshToken);

    // 存储过期时间戳
    localStorage.setItem('token_expires_at', expiresAt.toString());

    // 存储到 Cookie，并设置过期时间
    document.cookie = `access_token=${accessToken}; path=/; ${secureFlag}samesite=Lax; expires=${expiresString}`;
    document.cookie = `refresh_token=${refreshToken}; path=/; ${secureFlag}samesite=Lax; expires=${expiresString}`;
    document.cookie = `ACCESS_TOKEN=${accessToken}; path=/; ${secureFlag}samesite=Lax; expires=${expiresString}`;  // 兼容旧版
};

// 修改 clearToken，使其同时清理用户信息
export const clearToken = () => {
    // 清除 localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');

    // 兼容旧版
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('TOKEN_EXP');

    // 【新增】同时清理用户信息缓存
    clearUserCache();

    // ✅ 新增：清除 Cookie（设置过期时间为过去）
    const expiredDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = `access_token=; path=/; expires=${expiredDate}; secure; samesite=None`;
    document.cookie = `refresh_token=; path=/; expires=${expiredDate}; secure; samesite=None`;
    document.cookie = `ACCESS_TOKEN=; path=/; expires=${expiredDate}; secure; samesite=None`;  // 兼容旧版
};

// ==========================================
// 3. 核心：全局初始化函数 (重构版)
// ==========================================

/**
 * 初始化用户信息
 * 策略：优先读取本地缓存 -> 无缓存则请求 API -> 失败则重置为匿名
 * @param {Object} options
 * @param {boolean} options.forceRefresh - 是否强制请求 API（忽略缓存）
 * @param {boolean} options.console_log - 是否打印日志
 */
export async function initUserByToken({ forceRefresh = false, console_log = false } = {}) {
    const token = getToken();

    // 1. 没有 Token：直接处理为匿名
    if (!token) {
        resetStoreToAnonymous();
        return { user: null, role: 'anonymous' };
    }

    // ✅ 新增：检查 token 是否已过期（即使有缓存也要检查）
    const expiresAt = getTokenExpiresAt();
    const now = Date.now();

    if (expiresAt && expiresAt <= now) {
        if (console_log) console.log('🔒 [initUserByToken] Token 已过期，尝试刷新');

        const newToken = await refreshAccessToken();

        if (!newToken) {
            // 刷新失败，清除所有状态
            if (console_log) console.log('🔒 [initUserByToken] Token 刷新失败，重置为匿名状态');
            clearToken();
            resetStoreToAnonymous();
            return { user: null, role: 'anonymous' };
        }

        // 刷新成功，强制重新获取用户信息
        forceRefresh = true;
    }

    // 2. 尝试读取本地缓存（仅当 token 有效且未强制刷新时）
    if (!forceRefresh) {
        const cachedUser = getUserCache();
        if (cachedUser) {
            if (console_log) console.log('⚡️ 命中本地用户缓存', cachedUser);

            // 更新 Store
            updateUserStore(cachedUser);

            // 返回缓存数据
            return { user: cachedUser, role: cachedUser.role || 'user' };
        }
    }

    // 3. 缓存未命中或强制刷新：请求 API
    try {
        const res = await api(`${AUTH_API_BASE}/me`);

        if (!res) {
            throw new Error("API 返回空数据");
        }

        // 成功：存入缓存 + 更新 Store
        saveUserCache(res);
        updateUserStore(res);

        if (console_log) console.log('✅ 远程获取用户信息成功', res);

        return { user: res, role: res.role || 'user' };

    } catch (err) {
        if (console_log) console.error('🔒 [initUserByToken] 获取用户信息失败:', err);

        // 失败处理：清空 Token 和 缓存
        clearToken();
        resetStoreToAnonymous();

        return { user: null, role: 'anonymous' };
    }
}

// --- 内部辅助函数 ---

function updateUserStore(userData) {
    userStore.id = userData.id;
    userStore.username = userData.username;
    userStore.role = userData.role || 'user'; // 默认 user
    userStore.isAuthenticated = true;
}

function resetStoreToAnonymous() {
    userStore.id = null;
    userStore.username = null;
    userStore.role = 'anonymous';
    userStore.isAuthenticated = false;
}

// ==========================================
// 4. Token 刷新并发控制
// ==========================================

// 防止并发刷新
let refreshPromise = null;

/**
 * 刷新 Access Token
 * @returns {Promise<string|null>} 新的 access token，失败返回 null
 */
export async function refreshAccessToken() {
    // ✅ 如果已有刷新在进行，直接返回
    if (refreshPromise) {
        console.log('🔄 刷新已在进行，等待完成');
        return refreshPromise;
    }

    // ✅ 创建新的刷新操作并缓存
    refreshPromise = (async () => {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            console.warn('没有 refresh token，无法刷新');
            return null;
        }

        try {
            const res = await fetch(WEB_BASE + `${AUTH_API_BASE}/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (!res.ok) {
                // refresh token 过期或无效
                console.error('刷新 token 失败:', res.status);
                clearToken();
                return null;
            }

            const data = await res.json();

            // 保存新的 tokens
            saveToken(data.access_token, data.refresh_token, data.expires_in);

            console.log('✅ Token 刷新成功');
            return data.access_token;

        } catch (error) {
            console.error('刷新 token 异常:', error);
            clearToken();
            return null;
        } finally {
            // ✅ 清除缓存，允许下次刷新
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

function safeJsonParse(text) {
    if (typeof text !== 'string' || !text.trim()) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function toPlainHeaders(headers) {
    const plainHeaders = {};
    headers.forEach((value, key) => {
        plainHeaders[key] = value;
    });
    return plainHeaders;
}

function parseRetryAfter(value) {
    if (value === undefined || value === null || value === '') {
        return 0;
    }

    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
        return Math.max(0, Math.ceil(numericValue));
    }

    const parsedDate = Date.parse(value);
    if (!Number.isNaN(parsedDate)) {
        return Math.max(0, Math.ceil((parsedDate - Date.now()) / 1000));
    }

    return 0;
}

function getResponseDetail(data) {
    if (!data || typeof data !== 'object') {
        return null;
    }
    return data.detail ?? null;
}

function getErrorMessage(detail, rawText, status) {
    if (typeof detail === 'string' && detail.trim()) {
        return detail.trim();
    }

    if (detail && typeof detail === 'object' && typeof detail.message === 'string' && detail.message.trim()) {
        return detail.message.trim();
    }

    if (typeof rawText === 'string' && rawText.trim()) {
        return rawText.trim();
    }

    return `Request failed with status ${status}`;
}

function buildNormalizedErrorResponse(res, rawText) {
    const parsedData = safeJsonParse(rawText);
    const data = parsedData ?? (rawText ? { detail: rawText } : null);
    const detail = getResponseDetail(data);

    return {
        status: res.status,
        ok: res.ok,
        url: res.url,
        headers: toPlainHeaders(res.headers),
        data,
        detail,
        rawText,
        original: res
    };
}

function buildRateLimitNoticePayload(path, response) {
    const detail = response.detail;
    const detailObject = detail && typeof detail === 'object' ? detail : null;
    const retryAfterFromDetail = detailObject ? parseRetryAfter(detailObject.retry_after_seconds) : 0;
    const retryAfterFromHeader = parseRetryAfter(response.headers['retry-after']);
    const noticeMessage =
        typeof detail === 'string' && detail.trim()
            ? detail.trim()
            : (detailObject?.message && typeof detailObject.message === 'string' && detailObject.message.trim())
                ? detailObject.message.trim()
                : (typeof response.rawText === 'string' && response.rawText.trim())
                    ? response.rawText.trim()
                    : '';

    return {
        message: noticeMessage,
        retryAfterSeconds: retryAfterFromDetail || retryAfterFromHeader,
        resetAt: detailObject?.reset_at || '',
        limitType: detailObject?.limit_type || '',
        scope: detailObject?.scope || '',
        suggestLogin: Boolean(detailObject?.suggest_login),
        showLoginAction: !userStore.isAuthenticated && Boolean(detailObject?.suggest_login),
        isAuthenticated: userStore.isAuthenticated,
        path
    };
}

/**
 * 增强版 API 函数 - 统一的网络请求接口
 * @param {string} path - API 路径（会自动添加 WEB_BASE 前缀）
 * @param {Object} options - 请求选项
 * @param {string} options.method - HTTP 方法（默认 'GET'）
 * @param {Object} options.headers - 请求头（会自动添加 Authorization 和 Content-Type）
 * @param {any} options.body - 请求体（如果是对象会自动 JSON.stringify，FormData会直接传递）
 * @param {number} options.timeout - 超时时间（ms，默认 30000）
 * @param {boolean} options.showError - 是否自动显示错误提示（默认 true）
 * @param {string} options.responseType - 响应类型（'json'|'text'|'blob'，默认自动检测）
 * @returns {Promise<any>} - 解析后的响应数据
 */
export async function api(path, options = {}) {
    const {
        method = 'GET',
        headers = {},
        body = null,
        timeout = 300000,      // 默认300秒超时
        showError = true,      // 是否自动显示错误
        responseType = 'auto'  // 响应类型
    } = options;

    let token = getToken();

    // ===== 主动刷新：在token过期前10分钟或已过期时主动刷新 =====
    if (token) {
        const expiresAt = getTokenExpiresAt();
        const now = Date.now();

        // 检查是否需要刷新（3种情况）
        const needRefresh =
            !expiresAt ||                           // 1. 没有过期时间记录（可能是旧版本登录）
            (expiresAt <= now) ||                   // 2. 已经过期
            (expiresAt - now < 10 * 60 * 1000);     // 3. 10分钟内过期

        if (needRefresh) {
            const reason = !expiresAt ? '无过期记录' :
                          (expiresAt <= now) ? '已过期' :
                          '即将过期';
            // console.log(`🔄 主动刷新token (${reason})`);

            const newToken = await refreshAccessToken();
            if (newToken) {
                token = newToken;
            }
            // 如果刷新失败，token保持原值，后续401会再次尝试刷新
        }

        headers['Authorization'] = `Bearer ${token}`;
    }

    // 添加标准请求头（如果未设置）
    if (!headers['Accept']) {
        // 根据 responseType 设置 Accept 头
        if (responseType === 'json') {
            headers['Accept'] = 'application/json';
        } else if (responseType === 'blob') {
            headers['Accept'] = 'application/octet-stream';
        } else {
            // 默认接受 JSON，但也接受其他格式
            headers['Accept'] = 'application/json, text/plain, */*';
        }
    }

    // 注意：Accept-Encoding 由浏览器自动添加，不需要手动设置
    // 浏览器会自动添加: Accept-Encoding: gzip, deflate, br

    // 处理请求体
    let finalBody = body;

    // 自动添加 Content-Type（如果有 body 且未指定）
    if (body && !headers['Content-Type']) {
        // 如果是 FormData，不设置 Content-Type，让浏览器自动处理（包括 boundary）
        if (body instanceof FormData) {
            finalBody = body;
        } else if (typeof body === 'object') {
            // 如果是普通对象，转换为 JSON
            headers['Content-Type'] = 'application/json';
            finalBody = JSON.stringify(body);
        } else {
            // 字符串或其他类型直接传递
            finalBody = body;
        }
    } else if (body && typeof body === 'object' && !(body instanceof FormData)) {
        // 如果已设置 Content-Type 但 body 是对象，仍需 stringify
        if (headers['Content-Type'] === 'application/json') {
            finalBody = JSON.stringify(body);
        }
    }

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        let res = await fetch(WEB_BASE + path, {
            method,
            headers,
            body: finalBody,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // ===== 核心改动：401 时尝试刷新并重试 =====
        if (res.status === 401) {
            // console.log('收到 401，尝试刷新 token...');
            const newToken = await refreshAccessToken();

            if (newToken) {
                // 用新 token 重试请求
                headers['Authorization'] = `Bearer ${newToken}`;

                const retryController = new AbortController();
                const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);

                res = await fetch(WEB_BASE + path, {
                    method,
                    headers,
                    body: finalBody,
                    signal: retryController.signal
                });

                clearTimeout(retryTimeoutId);
            } else {
                console.log("token已過期")
            }
        }
        // =========================================

        // 统一错误处理
        if (!res.ok) {
            const rawText = await res.text();
            const normalizedResponse = buildNormalizedErrorResponse(res, rawText);
            const text = getErrorMessage(
                normalizedResponse.detail,
                normalizedResponse.rawText,
                normalizedResponse.status
            );
            const error = new Error(text || `請求失敗：${res.status}`);
            error.status = res.status;
            error.response = normalizedResponse;
            error.data = normalizedResponse.data;
            error.detail = normalizedResponse.detail;
            error.headers = normalizedResponse.headers;
            error.rawText = normalizedResponse.rawText;

            if (res.status === 429) {
                showRateLimitNotice(buildRateLimitNoticePayload(path, normalizedResponse));
            }
            throw error;
        }

        // 自动解析响应
        if (responseType === 'blob') {
            return res.blob();
        } else if (responseType === 'text') {
            return res.text();
        } else if (responseType === 'json') {
            return res.json();
        } else {
            // 自动检测
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                return res.json();
            } else if (ct.includes('application/octet-stream') || ct.includes('application/vnd.openxmlformats')) {
                return res.blob();
            } else {
                return res.text();
            }
        }

    } catch (err) {
        clearTimeout(timeoutId);

        // 超时错误处理
        if (err.name === 'AbortError') {
            throw new Error('請求超時，請稍後重試');
        }

        // 如果最终还是 401，清除 token（但不显示错误Toast，因为已经显示登录弹窗）
        if (err.status === 401) {
            clearToken();
            throw err;
        }

        // 可选：自动显示错误提示（如果项目中有全局提示函数）
        if (showError && err.status !== 429 && typeof window.showErrorToast === 'function') {
            window.showErrorToast(err.message);
        }

        throw err;
    }
}

export async function ensureAuthenticated(e) {
    try {
        const res = await api(`${AUTH_API_BASE}/me`);
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
        const userData = await api(`${AUTH_API_BASE}/me`, {
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

    const token = getToken();

    if (!token) {
        userStore.role = 'anonymous';
        userStore.isAuthenticated = false;
        return 'anonymous';
    }

    try {
        const user = await update_userdatas_bytoken(token, false);

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

/**
 * 上报在线时长
 * @param {number} duration - 在线时长（秒）
 * @returns {Promise<boolean>} - 是否上报成功
 */
export async function reportOnlineTime(duration) {
    // console.log('📊 [在线时长] 准备上报:', duration, '秒');

    const token = getToken();

    if (!token) {
        // console.log('⚠️ [在线时长] 未登录，跳过上报');
        return false;
    }

    if (duration <= 0) {
        // console.log('⚠️ [在线时长] 时长为0，跳过上报');
        return false;
    }

    // 后端限制：1秒到3600秒（1小时）
    const seconds = Math.max(1, Math.min(3600, Math.floor(duration)));

    // if (seconds !== duration) {
    //     console.log(`⚠️ [在线时长] 时长已调整: ${duration} -> ${seconds} 秒（后端限制1-3600秒）`);
    // }

    try {
        await api(`${AUTH_API_BASE}/report-online-time`, {
            method: 'POST',
            body: { seconds },  // ✅ 修复：使用 seconds 而不是 duration
            showError: false
        });

        // console.log('✅ [在线时长] 上报成功:', seconds, '秒');
        return true;
    } catch {
        // console.error('❌ [在线时长] 上报失败:', err);
        return false;
    }
}

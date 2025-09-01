// utils/auth.js

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

export async function api(path, { method = 'GET', headers = {}, body = null } = {}) {
    const token = getToken();
    const WEB_BASE = window.WEB_BASE || 'http://localhost:5000';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(WEB_BASE + path, { method, headers, body });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `請求失敗：${res.status}`);
    }
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
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

export async function update_userdatas_bytoken(token, console_log = false) {
    try {
        const userRes = await fetch(`${window.WEB_BASE}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (console_log) {
            if (userRes.ok) {
                const userData = await userRes.json();
                window.currentUser = userData;
                return userData;
            } else {
                console.warn("⚠️ /auth/me 回傳非 200 狀態");
                return null;
            }
        }
    } catch (err) {
        console.error("❌ 無法更新用戶資料", err);
        return null;
    }
}


export async function getUserRole() {
    if (typeof window.userRole !== 'undefined') {
        return window.userRole; // 只有 undefined 才會重新驗證
    }
    window.userRole = "anonymous";
    const token = localStorage.getItem("ACCESS_TOKEN")
    if (token) {
        // console.log(token)
        const user = await update_userdatas_bytoken(token, true);
        window.userRole = user?.role === "admin" ? "admin" : "user";
    }
    return window.userRole;

}
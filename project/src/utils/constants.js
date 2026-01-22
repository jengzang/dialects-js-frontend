// src/utils/constants.js
// 全局常量配置文件 - 统一管理所有魔法数字

// ========================================
// 表格配置
// ========================================
export const TABLE_CONFIG = {
    PAGE_SIZE: 50,                  // 每页显示条数
    MIN_WIDTH: 1000,                // 表格最小宽度(px)
    SEARCH_DEBOUNCE: 300,           // 搜索防抖延迟(ms)
    MOBILE_MIN_WIDTH: 800           // 移动端表格最小宽度(px)
}

// ========================================
// 查询配置
// ========================================
export const QUERY_CONFIG = {
    DEBOUNCE_DELAY: 1000,           // 查询防抖延迟(ms)
    MAX_TIMEOUT: 60000              // 最大请求超时(ms)
}

// ========================================
// 用户权限限制
// ========================================
export const ROLE_LIMITS = {
    anonymous: {
        MAX_COMBINATIONS: 10,        // 最大组合数
        MAX_RESULTS: 10              // 最大结果数
    },
    user: {
        MAX_COMBINATIONS: 200,
        MAX_RESULTS: 100
    },
    admin: {
        MAX_COMBINATIONS: Infinity,
        MAX_RESULTS: Infinity
    }
}

// ========================================
// 面板布局配置
// ========================================
export const PANEL_CONFIG = {
    ROW_GAP_PX: 120,                // 行间距(px)
    ROW_BOTTOM_START: 10,           // 底部起始位置(px)
    PANEL_HEIGHT: '50vh',           // 面板高度
    EXTRA_EMPTY_ROWS: 3,            // 额外空行数

    // 响应式断点
    BREAKPOINTS: {
        DESKTOP: 1200,               // ≥1200px: 4列
        TABLET: 768,                 // ≥768px: 2列
        MOBILE: 0                    // <768px: 1列
    }
}

// ========================================
// 轮询配置（如果必须使用轮询时的保护参数）
// ========================================
export const POLLING_CONFIG = {
    INTERVAL: 100,                   // 轮询间隔(ms)
    MAX_ATTEMPTS: 50,                // 最大尝试次数 (5秒)
    TIMEOUT: 5000                    // 超时时间(ms)
}

// ========================================
// API 配置
// ========================================
export const API_CONFIG = {
    DEFAULT_TIMEOUT: 30000,          // 默认超时时间(ms)
    LONG_TIMEOUT: 60000              // 长请求超时时间(ms)
}

// ========================================
// 布局响应式配置
// ========================================
export const LAYOUT_CONFIG = {
    // 列布局
    DESKTOP_COLS: 4,
    DESKTOP_WIDTH_PCT: 24,
    DESKTOP_GAP_PCT: 1,

    TABLET_COLS: 2,
    TABLET_WIDTH_PCT: 49,
    TABLET_GAP_PCT: 1,

    MOBILE_COLS: 1,
    MOBILE_WIDTH_PCT: 99,
    MOBILE_GAP_PCT: 0,

    // 面板
    VERTICAL_PANEL_HEIGHT: '33vh',
    HORIZONTAL_PANEL_HEIGHT: '50vh'
}

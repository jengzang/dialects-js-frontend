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
// 地点选择限制（用于 LocationAndRegionInput）
// ========================================
export const LOCATION_LIMITS = {
    // tab1: 查字
    tab1: {
        anonymous: {
            MAX_LOCATIONS: 300,
            MESSAGE: '未登錄用戶單次最多可查詢 {limit} 個地點'
        },
        user: {
            MAX_LOCATIONS: 600,
            MESSAGE: '用戶單次最多可查詢 {limit} 個地點'
        },
        admin: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        }
    },

    // tab2: 查中古
    tab2: {
        anonymous: {
            MAX_LOCATIONS: 200,
            MESSAGE: '未登錄用戶單次最多可查詢 {limit} 個地點'
        },
        user: {
            MAX_LOCATIONS: 600,
            MESSAGE: '用戶單次最多可查詢 {limit} 個地點'
        },
        admin: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        }
    },

    // tab3: 查音位 (最嚴格的限制)
    tab3: {
        anonymous: {
            MAX_LOCATIONS: 5,
            MESSAGE: '未登錄用戶查詢音位最多可選 {limit} 個地點'
        },
        user: {
            MAX_LOCATIONS: 30,
            MESSAGE: '用戶查詢音位最多可選 {limit} 個地點'
        },
        admin: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        }
    },

    // tab4: 查調 (無限制)
    tab4: {
        anonymous: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        },
        user: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        },
        admin: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        }
    },

    // divide: 分區繪圖 (無限制)
    divide: {
        anonymous: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        },
        user: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        },
        admin: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        }
    },

    // default: 其他場景使用 tab2 的限制
    default: {
        anonymous: {
            MAX_LOCATIONS: 200,
            MESSAGE: '未登錄用戶單次最多可查詢 {limit} 個地點'
        },
        user: {
            MAX_LOCATIONS: 600,
            MESSAGE: '用戶單次最多可查詢 {limit} 個地點'
        },
        admin: {
            MAX_LOCATIONS: Infinity,
            MESSAGE: ''
        }
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
    DEFAULT_TIMEOUT: 300000,          // 默认超时时间(ms)
    LONG_TIMEOUT: 600000              // 长请求超时时间(ms)
}

// ========================================
// 布局响应式配置
// ========================================
export const LAYOUT_CONFIG = {
    // 列布局
    DESKTOP_COLS: 3,
    DESKTOP_WIDTH_PCT: 32,
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

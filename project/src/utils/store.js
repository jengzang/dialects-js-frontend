// src/utils/store.js
import { ref, reactive } from 'vue'

// ========================================
// 全局 Payload（用于跨组件传递查询数据）
// ========================================
export const globalPayload = ref(null)

// ========================================
// 用户状态管理（替代 window.userRole 和 window.currentUser）
// ========================================
export const userStore = reactive({
    role: 'anonymous',        // 用户角色: 'anonymous' | 'user' | 'admin'
    isAuthenticated: false,   // 是否已认证
    username: null,           // 用户名
    id: null                  // 用户ID
})

// ========================================
// 地图状态管理
// ========================================
export const mapStore = reactive({
    mode: 'base',             // 默认模式
    mapData: null,            // 存放基础地图数据 (center, zoom, locations)
    mergedData: [],           // 存放特征数据 (results)
    loading: false,           // 共享加载状态
    selectedFeature: '',      // 当前选中的特征
    showCustomData: false     // 是否显示用户个人数据
})

// =================================
// =======
// 查询状态管理（替代 window.locationList 等）
// ========================================
export const queryStore = reactive({
    locations: [],            // 地点列表
    regions: [],              // 区域列表
    regionUsing: 'yindian'    // 使用的分区模式
})

// ========================================
// 结果缓存（替代 window._resultPageCache）
// ========================================
export const resultCache = reactive({
    mode: '',                 // 查询模式
    features: [],             // 特征列表
    latestResults: []         // 最新结果（替代 window.latestdetailResults）
})
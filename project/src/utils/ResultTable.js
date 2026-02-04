// utils/ResultTable.js
import { api } from './auth.js'
import { API_CONFIG } from '../config/constants.js'
import { resultCache } from './store.js'

// 假设 column_values 是全局变量，如果不是，需要作为参数传入
export function buildReverseMap() {
    const map = {};
    const conflictSet = new Set();
    if (typeof column_values === 'undefined') return { map, conflictSet };
    for (const [field, values] of Object.entries(column_values)) {
        for (const val of values) {
            if (!map[val]) {
                map[val] = field;
            } else {
                conflictSet.add(val);
                map[val] = null;
            }
        }
    }
    return { map, conflictSet };
}

export function parseFeatureString(featureStr) {
    // ... (保留原有的 parseFeatureString 完整逻辑)
    // 注意：原函数依赖 column_values，这里假设它在 window 上或你可以改为传参
    const matched_fields = {};
    const usedChars = new Set();
    const { map: reverseMap } = buildReverseMap();
    const allFieldNames = Object.keys(column_values || {});
    const allValues = Object.values(column_values || {}).flat();

    const hasAnyValue = allValues.some(val => featureStr.includes(val));
    if (!hasAnyValue) {
        return { matched_fields: null, unmatched_fields: allFieldNames };
    }

    const usedFields = new Set();
    for (const field of allFieldNames) {
        const fieldIdx = featureStr.indexOf(field);
        if (fieldIdx !== -1) {
            usedFields.add(field);
            const possibleVal = featureStr.slice(Math.max(0, fieldIdx - 2), fieldIdx);
            let foundVal = null;
            for (let len = 2; len >= 1; len--) {
                const val = possibleVal.slice(-len);
                if (column_values[field].includes(val)) {
                    foundVal = val;
                    break;
                }
            }
            if (foundVal) {
                matched_fields[field] = foundVal;
                usedChars.add(field);
                usedChars.add(foundVal);
            } else {
                matched_fields[field] = null;
                usedChars.add(field);
            }
        }
    }
    let remaining = featureStr;
    for (const val of usedChars) {
        remaining = remaining.replace(val, '');
    }
    for (let i = 0; i < remaining.length; i++) {
        const char = remaining[i];
        if (!char.trim()) continue;
        const field = reverseMap[char];
        if (field && !matched_fields[field]) {
            matched_fields[field] = char;
            usedFields.add(field);
        }
    }

    return { matched_fields, unmatched_fields: allFieldNames.filter(f => !usedFields.has(f)) };
}

export function getCorrespondingCharacters(item) {
    const multiCharDetails = {};
    if (item.多音字詳情) {
        item.多音字詳情.split(';').forEach(s => {
            const [ch, detail] = s.split(':').map(str => str.trim());
            if (ch && detail) multiCharDetails[ch] = detail;
        });
    }
    if (item.多地位詳情) {
        item.多地位詳情.split(';').forEach(s => {
            const [ch, detail] = s.split(':').map(str => str.trim());
            if (ch && detail) multiCharDetails[ch] = detail;
        });
    }
    return item.對應字.map(ch => ({
        type: 'span',
        props: multiCharDetails[ch]
            ? { class: 'char-vue multi-vue', datatitle: multiCharDetails[ch] }
            : { class: 'char-vue' },
        children: ch
    }));
}

// ④ get_detail：弹窗按钮会调用（用于新面板加载详情）
/**
 * * @param {String} label - 🌟 新增參數：用於接收 '音本位' 或 '字本位'，精確控制模式
 */
export async function get_detail(location, feature_value, bool=false, vue=false,
                                 mountTarget /* 廢棄 */, group_inputs = []) {

    if (!location || !feature_value) return;
    // ============================================
    // ★ 修改點 1：在 fetch 之前，先打開窗口！
    // ============================================
    let tempPanelId = null;

    if (typeof window.addPanel === 'function') {
        // 參數 1: [] (空數據)
        // 參數 2: true (開啟 Loading 動畫)
        // 返回值: 拿到這個窗口的 ID，稍後用來更新它
        tempPanelId = window.addPanel([], true);
    }
    // === 1. 參數準備邏輯 (融合你的舊邏輯與新邏輯) ===
    let status_inputs = [];
    let pho_values = [""];
    let regions = [""];

    let mode_raw = resultCache.mode || '';
    let mode = '';

    // 基礎模式判斷
    if (mode_raw === '查音位') mode = 'p2s';
    if (mode_raw === '查中古') mode = 's2p';


    const features = resultCache.features || [];
    const locations = Array.isArray(location) ? location : [location];
    const region_mode = window.regionusing || 'yindian'; // 防止報錯，給個默認值

    if (bool) {
        if (mode === 'p2s') {
            // ❗检查是否是合法汉字（+允许 -）
            if (!/^[\u4e00-\u9fa5\-\s]+$/.test(feature_value)) {
                status_inputs = []; // 清空
            } else {
                status_inputs = [feature_value];
            }
            mode = 's2p';
        } else if (mode === 's2p') {
            pho_values = [feature_value];
            mode = 'p2s';
        }
    } else {
        if (mode === 's2p') {
            if (!/^[\u4e00-\u9fa5\-\s]+$/.test(feature_value)) {
                status_inputs = [];
            } else {
                status_inputs = [feature_value];
            }
        } else if (mode === 'p2s') {
            pho_values = [feature_value];
        }
    }

    const payload = {
        mode,
        locations,
        regions,
        features,
        status_inputs,
        group_inputs,
        pho_values,
        region_mode
    };
    try {
        // ✅ 使用统一的 api 函数（替代 window.fetch）
        const result = await api('/api/phonology', {
            method: 'POST',
            body: payload,
            timeout: API_CONFIG.LONG_TIMEOUT  // 使用长超时时间（60秒）
        });

        // === 3. 處理數據 ===
        if (!result.results) {
            throw new Error(result.detail || "未返回 results");
        }

        const data = result.results;
        // 清除字數為0的數據
        const validData = data.filter(item => item.字數 !== 0);
        resultCache.latestResults = validData;

        if (validData.length === 0) {
            window.showWarningToast("未查詢到相關詳情");
            return;
        }

        // === 4. 🚀 渲染切換：從 DOM 操作改為調用 PanelManager ===
        // ============================================
        // ★ 修改點 2：請求成功後，更新剛才那個窗口
        // ============================================
        if (typeof window.updatePanel === 'function' && tempPanelId) {
            if (validData.length === 0) {
                window.showWarningToast("未查詢到相關詳情");
                // 如果沒數據，把那個轉圈圈的窗口關掉
                window.removePanel(tempPanelId);
            } else {
                // 有數據了！填入數據，updatePanel 會自動把 loading 設為 false
                window.updatePanel(tempPanelId, validData);
            }
        }

    } catch (error) {
        console.error("分析失敗", error);
        if (error.response && error.response.detail) {
            window.showErrorToast("錯誤信息：" + error.response.detail);
        } else {
            window.showErrorToast("請求後端錯誤：" + error.message);
        }
    }
}
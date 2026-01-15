// src/store/sharedState.js
import { ref } from 'vue'

// 這是一個全域的“臨時倉庫”，專門用來放 Payload
export const globalPayload = ref(null)

import { reactive } from 'vue';

export const mapStore = reactive({
    mode: 'base',           // 默認模式
    mapData: null,      // 存放基礎地圖數據 (center, zoom, locations)
    mergedData: [],     // 存放特徵數據 (results)
    loading: false,     // 共享加載狀態

    // // 用於更新數據的輔助函數 (可選，也可以直接修改屬性)
    // updateData(mapData, mergedData) {
    //     this.mapData = mapData;
    //     this.mergedData = mergedData || [];
    // }
});
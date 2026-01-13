// src/store/sharedState.js
import { ref } from 'vue'

// 這是一個全域的“臨時倉庫”，專門用來放 Payload
export const globalPayload = ref(null)
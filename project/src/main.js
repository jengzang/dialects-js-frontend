// src/main.js
// ⚠️ 必须在最开头导入环境配置
import './env-config.js'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// 🍎 导入全局消息系统（会自动挂载到 window）
import './utils/message.js'

// 1. 導入你的組件
import PanelManager from "./components/result/PanelManager.vue"

// 2. 建立 App 實例
const app = createApp(App)

// 3. 使用插件 (Router, Naive UI)
app.use(router)

// 4. ★ 註冊全局組件
// 第一個參數是你在 Template 中使用的標籤名稱 (例如 <PanelManager />)
// 第二個參數是導入的組件變數
app.component('PanelManager', PanelManager)

// 5. 掛載
app.mount('#app')
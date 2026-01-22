<template>
  <div>
    <div class="page">
      <div class="page-content-stack">
      <div class="page-footer">

        <small class="hint">
          🧩 您可以自由添加點、設置該點對應的特徵<br>
          🖌️ 網站會根據特徵自動分配顏色
        </small>
      </div>

      <div class="button-row">
        <button class="enter-btn" @click="handleLogin">🔐 登錄</button>
      </div>

      <div class="page-footer">
        <small class="hint">
          👤 您將創建的是僅屬於您的數據，故需要登錄<br>
          🤝 本站承諾：不會洩漏您的個人數據
        </small>
      </div>
    </div>
    </div>


    <div class="list-wrapper">
      <ul class="explain-list">
        <li><strong>點擊下方按鈕</strong> 右側將彈出一個面板</li>
        <li>您需在面板中填入簡稱、分區、聲韻調、特徵、值</li>
        <li>“聲韻調”是指分析的“聲母/韻母/聲調”</li>
        <li>“特徵”是指分析的類別，例如“流攝"</li>
        <li>“值”是顯示在地圖上的，例如“iu"</li>
        <li>點擊地圖即可自動填入經緯度</li>
      </ul>
    </div>

    <div class="run-container">
      <button
          class="run-btn add-single"
          @click="handleAddSingle">
        <span>📝 逐條添加</span>
      </button>
      <button
          class="run-btn add-batch"
          @click="handleAddBatch">
        <span>📋 批量添加</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showInfo } from '@/utils/message.js'

const router = useRouter()
const route = useRoute()
const locationRef = ref(null)
const isRunning = ref(false)

const handleLogin = () => {
  router.push('/auth')
}

// 運行邏輯 (複製並簡化)
function getLocation() {
  if (!locationRef.value?.selectedValue ||
      (Array.isArray(locationRef.value?.selectedValue) && locationRef.value.selectedValue.every(item => item === ''))) {
    return locationRef.value?.inputValue || '廣州';
  } else {
    return locationRef.value?.inputValue ;
  }
}

const runAction = () => {
  isRunning.value = true;
  const data = {
    mode: 'custom',
    location: getLocation(),
    region: locationRef.value?.selectedValue,
    region_source: locationRef.value?.regionUsing
  }

  sessionStorage.setItem('vueToNativeData', JSON.stringify(data))
  window.location.replace(window.WEB_BASE + '/detail/');
}

// 逐條添加：跳轉到 map 頁面並打開面板
const handleAddSingle = () => {
  router.replace({ query: { tab: 'map', sub: 'map', openPanel: 'true' } })
}

// 批量添加：顯示提示信息
const handleAddBatch = () => {
  showInfo('該功能尚未面向普通用戶開放')
}
</script>

<style scoped>
.button-row {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 12px;
}
.list-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
.explain-list {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin:  0;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
  max-width: 360px;
}
.explain-list li {
  white-space: nowrap;
  margin-bottom: 4px;
}

/* 按鈕容器：兩個按鈕並排 */
.run-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}


.run-btn.add-batch {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
}

.run-btn.add-batch:hover {
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

/* 移動端適配 */
@media (max-width: 480px) {
  .run-container {
    flex-direction: column;
    align-items: center;
  }

}
</style>
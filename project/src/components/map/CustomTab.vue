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

    <LocationAndRegionInput ref="locationRef" />

    <div class="list-wrapper">
      <ul class="explain-list">
        <li>請在上方填入您將添加的地點或其所屬分區</li>
        <li><strong>點擊下方按鈕</strong> 右側將彈出一個面板</li>
        <li>您需在面板中填入簡稱、分區、特徵、值</li>
        <li>“特徵”是指分析的類別，例如“流攝"</li>
        <li>“值”是顯示在地圖上的，例如“iu"</li>
        <li>點擊地圖即可自動填入經緯度</li>
      </ul>
    </div>

    <div class="fancy-run-container">
      <button
          class="fancy-run-btn"
          @click="runAction"
          :disabled="isRunning">
        <span v-if="isRunning">🔄 運行中...</span>
        <span v-else>🚀 添加個人數據</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LocationAndRegionInput from "@/components/query/LocationAndRegionInput.vue";

const router = useRouter()
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
/* 假設 fancy-run-btn 是全站通用的，這裡如果沒有全局樣式，你需要複製它的CSS */
</style>
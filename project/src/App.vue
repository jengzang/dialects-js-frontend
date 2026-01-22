<!-- ✅ App.vue -->
<template>
  <!-- 🧱 動態載入 layout -->
    <component :is="layoutComponent" />

  <PanelManager />

  <!-- 🍎 全局 Toast 提示 -->
  <GlobalToast />

  <!-- 🍎 全局确认对话框 -->
  <GlobalConfirm />
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import IntroLayout from './layouts/IntroLayout.vue'
import MenuLayout from './layouts/MenuLayout.vue'
import GlobalToast from './components/GlobalToast.vue'
import GlobalConfirm from './components/GlobalConfirm.vue'

// 🌉 建立 bridge 用於跨組件共享 iframe 狀態
const nativeFrame = ref(null)
const iframeReady = ref(false)

// 💡 提供給其他組件使用的 getter
export function getNativeBridge() {
  return {
    iframeReady,
    nativeFrame
  }
}

export default {
  components: {
    GlobalToast,
    GlobalConfirm
  },
  setup() {
    const route = useRoute()

    const layoutComponent = computed(() => {
      return route.path.startsWith('/intro') ? IntroLayout : MenuLayout
    })

    // 🔁 輪詢 iframe 是否掛上 window.receiveFromVue()
    function onIframeLoad() {
      console.log('📡 iframe 已加載，開始檢查 receiveFromVue...')
      const iframeWindow = nativeFrame.value?.contentWindow
      let tries = 0
      const interval = setInterval(() => {
        tries++
        if (iframeWindow && typeof iframeWindow.receiveFromVue === 'function') {
          iframeReady.value = true
          console.log('✅ receiveFromVue 掛載成功 🎉')
          clearInterval(interval)
        } else if (tries >= 20) {
          console.warn('❌ receiveFromVue 沒有出現（重試次數已滿）')
          clearInterval(interval)
        }
      }, 100)
    }

    return {
      layoutComponent,
      nativeFrame,
      onIframeLoad
    }
  }
}
</script>

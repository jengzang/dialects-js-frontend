<template>
  <div v-if="isVisible" class="floating-tools">

    <button v-if="currentTab === 'tab2' || currentTab === 'tab3'"
            class="close-btn" style="top:0;right: 0;height: 22px;width: 22px" @click="isVisible = false" :title="$t('query.components.floatingDice.closeButton')">
      ✕
    </button>

    <button v-if="currentTab === 'tab2' || currentTab === 'tab3'"
            class="dice-btn tool-btn" @click="handleRoll" :title="$t('query.components.floatingDice.diceButton')">
      🎲
    </button>

    <Transition name="scale-in">
      <button
          v-if="currentTab === 'tab2'"
          class="help-btn tool-btn"
          @click="isHelpOpen = true"
          :title="$t('query.components.floatingDice.helpButton')"
      >
        {{ $t('query.components.floatingDice.helpButton') }}
      </button>
    </Transition>
  </div>

  <Teleport to="body">
    <Transition name="fade-modal">
      <div v-if="isHelpOpen" class="glass-modal-overlay" @click.self="isHelpOpen = false">
        <div class="glass-card">
          <button
            class="close-btn"
            @click="isHelpOpen = false"
            :title="$t('common.button.close')"
            :aria-label="$t('common.button.close')"
          >
            &times;
          </button>

          <h2 class="modal-title">{{ $t('query.components.floatingDice.modalTitle') }}</h2>

          <div class="scroll-content">
            <div id='display-detail3' class="panel-content">
              <p style="margin: 0">
                {{ $t('query.components.floatingDice.examples.title') }}<br>
                {{ $t('query.components.floatingDice.examples.example1') }}
              </p>
              <p
                v-for="index in [2, 3, 4, 5, 6, 7, 8, 9, 10]"
                :key="`example-${index}`"
                style="margin: 0"
              >
                {{ $t(`query.components.floatingDice.examples.example${index}`) }}
              </p>

              <div class="divider"></div>
              <p style="margin-bottom:8px;font-size: 17px; font-weight: bold;">
                {{ $t('query.components.floatingDice.tableTitle') }}
              </p>
              <div class="table-wrapper">
                <table class="feature-table">
                  <thead>
                    <tr>
                      <th width="60">{{ $t('query.components.floatingDice.tableHeaders.category') }}</th>
                      <th>{{ $t('query.components.floatingDice.tableHeaders.values') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in supportedInputRows" :key="row.category">
                      <td>{{ row.category }}</td>
                      <td>{{ row.values }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="divider"></div>
              <p v-for="index in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="`note-${index}`">
                <span :class="index === 1 ? 'example-desc' : null">
                  {{ $t(`query.components.floatingDice.notes.note${index}`) }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  currentTab: {
    type: String,
    required: true
  }
})

// ✅ 定義事件：向父組件發送配置數據
const emit = defineEmits(['applyConfig'])

const isHelpOpen = ref(false)
const diceIndex = ref(0) // 索引狀態移到這裡管理
const isVisible = ref(true)
const supportedInputRowKeys = [
  'she',
  'yun',
  'hu',
  'deng',
  'ru',
  'diao',
  'buwei',
  'fangshi',
  'qingzhuo',
  'xi',
  'zu',
  'mu'
]
const supportedInputRows = computed(() =>
  supportedInputRowKeys.map((rowKey) => ({
    category: t(`query.components.floatingDice.inputRows.${rowKey}.category`),
    values: t(`query.components.floatingDice.inputRows.${rowKey}.values`)
  }))
)
// ==========================================
// 1. 數據部分
// ==========================================
const presets_tab2 = [
  {
    card: '韻母',
    keys: ['攝'],
    values: { '攝': ['流', '深'] }, // 多選值
    loc: { locations: ['广州 梅縣 汕头'], regions: ['瓊崖'], regionUsing: 'yindian' }
  },
  {
    card: '聲母',
    keys: ['母'],
    values: { '母': ['精'] },
    loc: { locations: ['鬱林 北流'], regions: ['吳化','銅容'], regionUsing: 'yindian' }
  },
  {
    card: '聲調',
    keys: ['清濁','調'],
    values: { '清濁': ['次濁'] ,'調': ['上'] },
    loc: { locations: ['台山台城 新會會城 東莞橋頭'], regions: ['東江'], regionUsing: 'yindian' }
  },
  {
    card: '韻母',
    keys: ['攝', '等'], // 多個 Key
    values: { '攝': ['蟹'], '等': ['一', '二', '三', '四'] },
    loc: { locations: ['南雄'], regions: ['韶州'], regionUsing: 'yindian' }
  },
  {
    card: '韻母',
    keys: ['攝'],
    values: { '攝': ['山'] },
    loc: { locations: ['博羅'], regions: ['四邑片'], regionUsing: 'map' }
  },
  {
    card: '聲母',
    keys: ['組', '等'], // 多個 Key
    values: { '組': ['見'], '等': [ '二'] },
    loc: { locations: ['南京 鹽城 淮安 廬江'], regions: ['海泗'], regionUsing: 'yindian' }
  },
  {
    card: '韻母',
    keys: ['韻'],
    values: { '韻': ['豪'] },
    loc: { locations: ['銀川 天津 邢臺'], regions: ['魯中'], regionUsing: 'yindian' }
  },
  {
    card: '聲母',
    keys: ['組', '等'], // 多個 Key
    values: { '組': ['知'], '等': [ '三'] },
    loc: { locations: ['髙安 修水'], regions: ['撫州'], regionUsing: 'yindian' }
  },
]
const presets_tab3 = [
  {
    card: '韻母',
    keys: ['攝'],
    tab3KeyInput:['a'],
    loc: { locations: ['揭陽 饒平 永安 福州'], regions: ['莆仙'], regionUsing: 'yindian' }
  },
  {
    card: '聲母',
    keys: ['組'],
    tab3KeyInput:['h'],
    loc: { locations: ['台山斗山墟 恩平恩城 鶴山雅瑤 從化獅象'], regions: ['南海'], regionUsing: 'yindian' }
  },
]

// ==========================================
// 2. 邏輯部分 (處理隨機並打包數據)
// ==========================================
function handleRoll() {
  const isTab3 = props.currentTab === 'tab3'
  const list = isTab3 ? presets_tab3 : presets_tab2

  // 安全取值
  const safeIndex = diceIndex.value % list.length
  const config = list[safeIndex]

  // 📦 打包數據 (Payload)
  // 將父組件需要的所有信息打包成一個對象
  const payload = {
    isTab3: isTab3,
    card: config.card,
    keys: [...config.keys], // 複製數組
    loc: {
      locations: [...config.loc.locations],
      regions: [...config.loc.regions],
      regionUsing: config.loc.regionUsing
    }
  }

  // 根據 Tab 不同，填充不同的值數據
  if (isTab3) {
    // Tab3: 傳遞輸入框字符串
    // 注意：這裡處理了 undefined 情況
    payload.tab3InputValue = config.tab3KeyInput ? config.tab3KeyInput[0] : ''
  } else {
    // Tab2: 傳遞下拉菜單的 Map
    const newMap = {}
    if (config.values) {
      for (const k in config.values) {
        newMap[k] = [...config.values[k]]
      }
    }
    payload.valuesMap = newMap
  }

  // 🚀 發射數據給父組件
  emit('applyConfig', payload)

  // 索引遞增
  diceIndex.value++
}
</script>

<style scoped>
/* 悬浮工具栏位置 */
.floating-tools {
  position: fixed;
  right: 16px;
  bottom: 63dvh; /* 根据实际页面调整高度，避免遮挡底部 Tab */
  display: flex;
  flex-direction: column;
  z-index: 99;
}

/* 按钮通用样式 (Apple 风格圆形按钮) */
.help-btn {
  border-radius: 12px;
  border: none;
  white-space: nowrap;
  font-size: 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-btn:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  background: #fff;
}

.help-btn:active {
  transform: scale(0.95);
}

.help-btn {
  color: #007aff;
  font-weight: bold;
}

/* ----------- 🍎 全屏液态玻璃弹窗 ----------- */


.glass-card {
  position: relative;
  width: 90%;
  max-width: 700px;
  height: 85vh; /* 弹窗高度 */
  padding: 0; /* padding 交给内部容器 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}


.modal-title {
  padding: 20px 20px 10px;
  margin: 0;
  font-size: 20px;
  text-align: center;
  color: #1d1d1f;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 25px;
  -webkit-overflow-scrolling: touch;
}

.divider {
  height: 1px;
  background: rgba(0,0,0,0.08);
  margin: 15px 0;
}

/* ----------- 表格样式 ----------- */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
}

.feature-table {
  width: 100%;
  border-collapse: collapse;
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif;
  font-size: 14px;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 12px;
  overflow: hidden;
  color: #222;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  /* 添加陰影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 平滑過渡效果 */
}

.feature-table th,
.feature-table td {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 12px 15px;  /* 增加間距 */
  text-align: left;
  vertical-align: top;
  word-wrap: break-word;  /* 強制換行 */
  white-space: normal;
}

.feature-table th {
  background: rgba(255, 255, 255, 0.3);
  font-weight: bold;
  color: #000;
  white-space: nowrap;  /* 防止文字換行 */
  overflow: hidden;     /* 防止超出範圍 */
  text-overflow: ellipsis; /* 當文字過長時顯示省略號 */
}


.feature-table td {
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.1);  /* 單元格背景 */
}

/* 增加 hover 效果 */
.feature-table tr:hover {
  /*transform: translateY(-5px);  !* 偏移 *!*/
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);  /* 放大陰影 */
}

/* 奇偶行交替背景色 */
.feature-table tr:nth-child(odd) {
  background-color: rgba(255, 255, 255, 0.05);
}

.feature-table tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.1);
}

/* ----------- 你的自定义样式类 ----------- */
.example-input {
  font-family: "SF Pro Display", "PingFang TC", "Helvetica Neue", sans-serif;
  font-weight: bold;
  color: #007aff; /* 蘋果藍 */
  margin: 0 2px;
}

.example-desc {
  font-family: "楷体", "Times New Roman", serif;
  font-size: 17px; /*稍微调整以匹配正文*/
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(68, 68, 68, 0.3);
  color: #444;
  margin: 0 2px;
}

.panel-content p {
  line-height: 1.8;
  margin-bottom: 8px;
  color: #333;
}

/* 按钮动画 */
.scale-in-enter-active,
.scale-in-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-in-enter-from,
.scale-in-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(-20px);
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

/* 骰子按鈕樣式 */
.dice-btn {
  background: transparent;
  border: none;
  font-size: 35px;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  justify-self: left;
}

.dice-btn:hover {
  transform: scale(1.1) rotate(20deg); /* 懸停時稍微放大並旋轉 */
}

.dice-btn:active {
  transform: scale(0.95);
}
</style>

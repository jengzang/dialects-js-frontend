<template>
  <div class="tools-page">
      <h2 class="page-title">工具箱</h2>

      <div class="tools-grid">
        <button class="tool-btn" @click="handleDataCheck">
          <div class="tool-icon">🔍</div>
          <div class="tool-name">字表檢查</div>
          <div class="tool-desc">檢查字表正確性和格式</div>
        </button>

        <button class="tool-btn" @click="handleJyutpingToIpa">
          <div class="tool-icon">🔄</div>
          <div class="tool-name">粵拼轉IPA</div>
          <div class="tool-desc">將粵拼轉換為國際音標</div>
        </button>

        <button class="tool-btn" @click="handleMergeTables">
          <div class="tool-icon">🔗</div>
          <div class="tool-name">字表合併</div>
          <div class="tool-desc">合併多個字表數據</div>
        </button>

        <button class="tool-btn" @click="handlePraatTables">
          <div class="tool-icon">👂️</div>
          <div class="tool-name">聲學分析</div>
          <div class="tool-desc">基於praat進行基頻、共振峰等分析</div>
        </button>

      </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到对应的工具页面
const handleDataCheck = () => {
  router.push('/explore?page=check')
};

const handleJyutpingToIpa = () => {
  router.push('/explore?page=jyut2ipa')
};

const handleMergeTables = () => {
  router.push('/explore?page=merge')
};

const handlePraatTables = () => {
  router.push('/explore?page=praat')
};

</script>

<style scoped>
.tools-page {
  min-width: 80dvw;
  display: flex;
  justify-content: center;

  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 70dvh;
}


.page-title {
  margin: 0 0 40px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0b2540;
  text-align: center;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  width: 100%;
}

.tool-btn {
  padding: 24px 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.tool-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3));
  border-color: rgba(0, 122, 255, 0.3);
}

.tool-btn:active {
  transform: translateY(-2px);
}

.tool-icon {
  font-size: 48px;
  line-height: 1;
}

.tool-name {
  font-size: 20px;
  font-weight: 700;
  color: #005fd3;
}

.tool-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* 移动端适配 */
@media (max-aspect-ratio: 1/1) {

  .page-title {
    font-size: 24px;
    margin-bottom: 15px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tool-btn {
    padding: 12px 12px;
  }

  .tool-icon {
    font-size: 30px;
  }

  .tool-name {
    font-size: 18px;
  }

  .tool-desc {
    font-size: 12px;
  }
}
</style>

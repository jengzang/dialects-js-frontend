<template>
  <div class="data-page">
      <h2 class="page-title">音系</h2>

      <div class="data-grid">
        <button class="data-btn" @click="handlePhonologyMatrix">
          <div class="data-icon">🔍️</div>
          <div class="data-name">音系查詢</div>
          <div class="data-desc">聲母韻母聲調-對照表</div>
        </button>

        <button class="data-btn" @click="handleCount">
          <div class="data-icon">📐</div>
          <div class="data-name">音素分類</div>
          <div class="data-desc">根據不同的特徵項自定義查詢聲韻調</div>
        </button>

        <button class="data-btn" @click="handleCount">
          <div class="data-icon">🧮</div>
          <div class="data-name">音節統計</div>
          <div class="data-desc">統計所查方言點的聲韻調數目</div>
        </button>

        <button class="data-btn" @click="handleZhongGu">
          <div class="data-icon">✍️</div>
          <div class="data-name">中古地位</div>
          <div class="data-desc">查看漢字中古地位信息</div>
        </button>

      </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleZhongGu = () => {
  router.push('/explore?page=ZhongGu')
};

const handlePhonologyMatrix = () => {
  router.push('/explore?page=phonologyMatrix')
};

const handleCount = () => {
  router.push('/explore?page=Countphos')
};
const handlePhoCustom = () =>{
  router.push('/explore?page=phonologyCustom')
}
</script>

<style scoped>
.data-page {
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

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  width: 100%;
}

.data-btn {
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

.data-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3));
  border-color: rgba(0, 122, 255, 0.3);
}

.data-btn:active {
  transform: translateY(-2px);
}

.data-icon {
  font-size: 48px;
  line-height: 1;
}

.data-name {
  font-size: 20px;
  font-weight: 700;
  color: #005fd3;
}

.data-desc {
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

  .data-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .data-btn {
    padding: 12px 12px;
  }

  .data-icon {
    font-size: 30px;
  }

  .data-name {
    font-size: 18px;
  }

  .data-desc {
    font-size: 12px;
  }
}
</style>

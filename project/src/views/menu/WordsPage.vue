<template>
  <div class="words-page">
      <h2 class="page-title">詞彙與語法</h2>

      <div class="words-grid">
        <button class="word-btn" @click="handleYuBaoVocabulary">
          <div class="word-icon">📖</div>
          <div class="word-name">語保詞彙</div>
          <div class="word-desc">語保1000詞表</div>
        </button>

        <button class="word-btn" @click="handleYcSpoken">
          <div class="word-icon">💬</div>
          <div class="word-name">陽春口語詞</div>
          <div class="word-desc">廣東陽春口語單字詞表</div>
        </button>

        <button class="word-btn" @click="handleYuBaoGrammar">
          <div class="word-icon">🗣️</div>
          <div class="word-name">語保語法</div>
          <div class="word-desc">語保50條句子語法資料</div>
        </button>
      </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleYcSpoken = () => {
  router.push('/explore?page=ycSpoken')
};

const handleYuBaoVocabulary = () => {
  router.push('/explore?page=YuBao&sub=vocabulary')
};

const handleYuBaoGrammar = () => {
  router.push('/explore?page=YuBao&sub=grammar')
};
</script>

<style scoped>
.words-page {
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

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  width: 100%;
}

.word-btn {
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

.word-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3));
  border-color: rgba(0, 122, 255, 0.3);
}

.word-btn:active {
  transform: translateY(-2px);
}

.word-icon {
  font-size: 48px;
  line-height: 1;
}

.word-name {
  font-size: 20px;
  font-weight: 700;
  color: #005fd3;
}

.word-desc {
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

  .words-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .word-btn {
    padding: 12px 12px;
  }

  .word-icon {
    font-size: 30px;
  }

  .word-name {
    font-size: 18px;
  }

  .word-desc {
    font-size: 12px;
  }
}
</style>

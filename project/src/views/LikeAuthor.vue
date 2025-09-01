<template>
  <div>
    <div class="cards-container">
      <h2 class="tabs-title like-author-title">
        ❤️ 喜歡作者
        <button class="follow-button" @click="followClicked">
          關注
        </button>
      </h2>
      <p style="margin: 0">「如果你覺得項目不錯，可以給個 ⭐️ 嗎！」</p>

      <a
          class="project-card"
          v-for="project in projects"
          :key="project.name"
          :href="project.url"
          target="_blank"
          rel="noopener noreferrer"
      >
        <div class="card-header">
          <img class="github-icon" src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" />
          <span class="thanks-link" style="font-weight: bold">{{ project.name }}</span>
        </div>
        <p>{{ project.description }}</p>
        <div class="glow-border"></div>
      </a>
      <p style="margin-top: 2rem">
        「若網站對您有幫助，可以請作者喝杯咖啡☕️，您的支持將是作者持續維護的動力🙏」
        <br />
        <button class="support-button" @click="showQRCodes = true">
          🙌 支持一下
        </button>
        <br />
        <span class="support-note">
          「注：本站由一名本科生開發運營，從字表處理、後端API到前端界面皆一人完成；
          服務器和域名的開銷，也是從生活費中省出來的💸」
        </span>
      </p>
    </div>
    <div v-if="showQRCodes" class="qr-modal">
      <div class="qr-modal-content">
        <!-- ❌ 右上角關閉 -->
        <button class="qr-close-btn" @click="showQRCodes = false">✖️</button>

        <!-- 標題 -->
        <h3 class="qr-title">☕️ 請作者喝杯咖啡</h3>
        <p class="qr-subtitle">感謝您的支持！ 💖</p>
        <!-- 二維碼區 -->
        <div class="qr-image-group">
          <div class="qr-box">
            <img :src="weixinQR" alt="微信收款碼" />
<!--            <p>微信支付</p>-->
          </div>
          <div class="qr-box">
            <img :src="alipayQR" alt="支付寶收款碼" />
<!--            <p>支付寶</p>-->
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref } from 'vue' // ✅ 別忘了引入 ref
import weixinQR from '@/assets/weixin.png'
import alipayQR from '@/assets/zfb.jpg'
// ✅ 控制彈窗顯示的開關
const showQRCodes = ref(false)

const projects = [
  {
    name: 'dialects-js-frontend',
    url: 'https://github.com/jengzang/dialects-js-frontend',
    description: '前端倉庫 - 使用原生js和vue開發'
  },
  {
    name: 'dialects-backend',
    url: 'https://github.com/jengzang/dialects-backend',
    description: '後端倉庫 - 基於fastapi'
  },
  {
    name: 'dialects-build',
    url: 'https://github.com/jengzang/dialects-build',
    description: '字表預處理倉庫 - 提取各種格式字表的聲韻調'
  },
]
function followClicked() {
  window.open('https://www.zhihu.com/people/da-shu-18-11', '_blank');
}

</script>

<style scoped>
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  text-align: center;
}

.project-card {
  position: relative;
  display: block;
  flex: 1 1 300px;
  max-width: 350px;
  background-color: #ffffff; /* 主體白色 */
  border-radius: 12px;
  padding: 1.1rem;
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  z-index: 0;
  border: 2px solid transparent; /* 邊框起手設置 */
}

.project-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 0 12px rgba(63, 142, 255, 0.2);
}

/* 呼吸邊框效果 */
.project-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 14px;
  background: linear-gradient(45deg, #7ec8ff, #d0eaff, #7ec8ff);
  background-size: 400% 400%;
  animation: breathing 6s ease infinite;
  z-index: -1;
  filter: blur(4px);
  opacity: 0.5;
}

@keyframes breathing {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #3f8eff; /* 蘋果藍，清爽版 */
}

.github-icon {
  width: 22px;
  height: 22px;
  margin-right: 0.5rem;
}

.project-card p {
  color: #444;
  line-height: 1.6;
  margin: 0.5rem 0.5rem 0.2rem;
  font-size: 1rem;
  white-space: nowrap;
}

.like-author-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.follow-button {
  background-color: #3f8eff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.9rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 2px 5px rgba(63, 142, 255, 0.3);
}

.follow-button:hover {
  background-color: #5fa4ff;
  transform: scale(1.05);
}

.support-button {
  margin-top: 1rem;
  background-color: #c52f27; /* Apple-style 紅 */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(255, 59, 48, 0.35);
  transition: all 0.2s ease;
}

.support-button:hover {
  background-color: #ff615c;
  transform: scale(1.05);
}


.support-note {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.88rem;
  color: #555;
  line-height: 1.5;
  max-width: 500px;
}


/* ✅ 手機版適配 */
@media (max-width: 600px) {
  .project-card {
    padding: 1.5rem;
  }

  .card-header {
    font-size: 1.4rem;
  }

  .project-card p {
    font-size: 1.1rem;
  }

  .github-icon {
    width: 24px;
    height: 24px;
  }
}


/* 全頁遮罩 */
.qr-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  overflow: auto; /* ✅ 背景本身也可滾動 */
}


/* 彈窗主體卡片 */
.qr-modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 460px;
  max-height: 90vh; /* ✅ 限高 */
  overflow-y: auto; /* ✅ 超出可滾動 */
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  text-align: center;
}


/* 標題 */
.qr-title {
  margin: 0;
  font-size: 1.5rem;
  color: #ff3b30;
}

/* 子標題 */
.qr-subtitle {
  margin: 0.5rem 0 1.5rem;
  font-size: 1rem;
  color: #666;
}

/* 二維碼排版區 */
.qr-image-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.qr-box {
  flex: 1 1 120px;
  max-width: 160px;
  text-align: center;
}


.qr-box img {
  width: 100%;
  max-width: 300px;   /* ✅ 最大寬度，超過不放大 */
  height: auto;       /* ✅ 高度自適應，保持比例 */
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.qr-box img:hover {
  transform: scale(1.2);
}


/* 關閉按鈕 */
.qr-close-btn {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  transition: color 0.2s;
}

.qr-close-btn:hover {
  color: #333;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 手機適配 */
@media (max-width: 500px) {
  .qr-modal-content {
    padding: 1.5rem 1rem;
  }

  .qr-box img {
    width: 120px;
  }
}

</style>

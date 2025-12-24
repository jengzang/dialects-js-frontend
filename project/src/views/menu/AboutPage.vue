<template>
  <div class="tabs-wrapper">
    <div class="tabs">
      <div
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab', { active: currentTab === tab.name }]"
          @click="currentTab = tab.name"
      >
        {{ tab.label }}
      </div>
    </div>

      <!-- 新的“簡介”页面 -->
      <div v-if="currentTab === 'intro'" class="thanks-container">
<!--        <div class="thanks-container">-->
          <h2 class="tabs-title">ℹ️ 關於網站</h2>
          <p style=" text-align: left;">「方音圖鑑」是一個專注於中古地位分析、方言比較、地理語言學的線上工具，致力於以清晰、互動的方式呈現各方言點聲韻層次及音位分合。</p>
          <ul class="customlist">
            <li>功能1：<strong>查中古</strong>（按中古地位整理讀音）。
              使用者可輸入各種組合進行分析，目前支持攝、韻、等、呼、調、系、組、母、清濁、發音部位、發聲方式等類別。
              網站會按輸入的組合分析聲母/韻母/聲調，並把結果呈現在表格和地圖中。</li>
            <li>功能2：<strong>查音位</strong>（分析音位的中古來源）。
              使用者可輸入上述類別，網站會分析輸入的音值（音位）對應字的中古來源，並把結果呈現在表格和地圖中。</li>
            <li>功能3：<strong>查調</strong>（查詢調值、調類）。
              網站會根據用戶選擇的分區、地點，整理調值、調類，不同的調類標上了不同的顏色。</li>
            <li>功能4：<strong>查字</strong>（查詢字音、地位）。
              根據用戶輸入漢字進行查詢，最終呈現各個地點的音值、注釋以及漢字中古地位</li>
            <li>功能5：<strong>分區繪圖</strong>（按地圖集二分區/音典分區繪製方言地圖）。</li>
            <li>功能6：<strong>自定義繪圖</strong>（用戶添加個人數據進行繪圖）。
              用戶可以自己在地圖上選點、標註，網站會根據特徵值自定分配顏色</li>
            <li>表格裡的<strong>藍色字</strong>（地位、音值等）一般都是可以點擊的，點擊後即在新的彈窗中進行細分查詢，方便與原結果對比分析</li>
            <li>地圖上的點也可以點擊，點擊後即可查詢詳細信息。</li>
          </ul>
          <p style=" text-align: left;font-weight: bold;text-decoration: underline">歡迎探索《方音圖鑑》，一起觸摸方言的歷史層次！</p>
        </div>
<!--      </div>-->

      <!-- 新的“感悟”页面 -->
      <div v-if="currentTab === 'reflection'" class="thanks-container">
        <h2 class="tabs-title" style="margin-top: 20px">🧑‍💻 開發感悟</h2>
        <p class="thoughts" style="text-align: left">    最初，我只想為自己的研究製作稱手的工具，卻在不知不覺間，探索了廣袤的星空。
          從第一行代碼到第一個功能，從稚嫩的構想到漸豐的體系，昼夜在鍵盤上更迭，我的構想也逐漸從虛無中落地生根。
          我看著這個網站，就如同看著自家的孩子蹣跚學步，一步步走出自己的輪廓。
          每一個按鈕、每一次交互，都烙印著一段時光。我曾為如果實現想要的查詢邏輯而精疲力竭，也曾為視覺效果的成功呈現而雀躍不已
          ——這些點滴，匯成了她的血與肉、魂與靈。</p>
        <p class="thoughts" style="text-align: left">    其實，這亦是自我蛻變的歷程。從對前端一無所知，到摸索DOM、嘗試虛擬滾動，進階至運用框架，乃至領略JWT、ORM的精妙。
          我在建造中學習，在錯誤中成熟。最迷人之處在於，我用以搭建這一切的磚石，正是我渴望學習的知識本身：
          網站的搭建深化了我對音韻的理解，而鑽研音韻又驅動著代碼的迭代。
          技術於我，不再是冷冰冰的指令，而是承載文化的舟楫；文化於我，亦不再是遙遠的文獻，逐步化為可交互、可追溯、可觸摸的實體。</p>
        <p class="thoughts" style="text-align: left">    這便是我用代碼與熱愛寫就的答卷，一個普通學生獻給方言領域最誠摯的禮物。
          感謝每一位與它相遇的你。希望這份仍顯稚拙的創作，能激起你心中一絲好奇的漣漪，
          或為你節省資料翻檢的片刻光陰，這便是她存在的意義。</p>
        <p class="thoughts"><em>願八方鄉音，生生不息；<br>願漢字之美，永被珍惜；<br>願文明薪火，長存於每一次交互與共鳴之中。</em></p>

        <h2 class="tabs-title" style="margin-top: 20px">🙏 特別鳴謝</h2>
        <ul class="thanks-list">
          <li>
            ✔ <a href="https://mcpdict.vear.vip/" target="_blank" rel="noopener noreferrer" class="thanks-link">漢字音典</a>
            - 本網站大部分資料來自<a href="https://github.com/osfans/MCPDict/tree/master/tools/tables/output"
                                     target="_blank" rel="noopener noreferrer" class="thanks-link">音典開源數據</a>
          </li>
          <li>
            ✔ <a href="https://jyutjam.org/" target="_blank" rel="noopener noreferrer"
                 class="thanks-link">嶺南粵音</a> - 提供了交流的平台 及<a href="https://jyutdict.org/"
                                                                          target="_blank" rel="noopener noreferrer" class="thanks-link">泛粵大典</a>
          </li>
          <li>
            ✔ <a href="https://zhongguoyuyan.cn/" target="_blank" rel="noopener noreferrer"
                 class="thanks-link">語保</a> - 篩選了部分資料
          </li>
          <li>
            ✔ <a href="https://xiaoxue.iis.sinica.edu.tw/ccrdata/" target="_blank" rel="noopener noreferrer"
                 class="thanks-link">小學堂</a> - 篩選了部分資料
          </li>
          <li>
            ✔ <a href="http://1.14.238.88:8099/dialect/main/about.html" target="_blank" rel="noopener noreferrer"
                 class="thanks-link">粵閩客方言系統</a> - 篩選了部分資料
          </li>
          <li>
            ✔ <a href="#" class="thanks-link">測試人員</a> - 正式上線之前測試、提建議的網友！
          </li>
          <li style="margin-bottom: 0">
            ✔ <a href="#" class="thanks-link">朋友 ❤️</a> - 在項目開發過程中，
            所有支持、鼓勵、幫助過我的朋友！
          </li>
          <li>
            ✔ <a href="#" class="thanks-link">你 ❤️</a> - 當然，還有看到這裡的你！
          </li>
        </ul>
        <p style="font-size:2rem;margin-top:0.5rem;margin-bottom: 3rem">💖🌟🥳</p>
      </div>

      <!-- 新的“建議”页面 -->
      <div v-if="currentTab === 'suggestion'" class="page">
        <div class="suggestion-box">
          <h2 class="tabs-title">💬 我有建議</h2>
          <p>發現 bug？有建議？<br />歡迎通過 GitHub Issue 提出！</p>
          <p class="subtext">👇 點擊下方卡片跳轉對應倉庫</p>
          <div class="card-links">
            <a
                href="https://github.com/jengzang/dialects-js-frontend/issues"
                target="_blank"
                rel="noopener"
                class="card"
            >
              🐞 網頁運行有 bug❓<br />💡 對交互、UI 有建議❓
              <span class="thanks-link">👉 到前端倉庫提 Issue</span>
            </a>
            <a
                href="https://github.com/jengzang/dialects-build/issues"
                target="_blank"
                rel="noopener"
                class="card"
            >
              🔤 對字表有疑問❓<br />🎯 聲/韻/調 提取出錯❓
              <span class="thanks-link">👉 到字表處理倉庫提 Issue</span>
            </a>
          </div>
        </div>
      </div>

      <!-- 新的“喜歡”页面 -->
      <div v-if="currentTab === 'like'" class="cards-container">
          <h2 class="tabs-title like-author-title">
            ❤️ 喜歡作者
            <button class="follow-button" @click="followClicked">
              關注
            </button>
          </h2>
          <p style="display: block; width: 100%; clear: both; margin: 0;">
            「如果你覺得項目不錯，可以給個 ⭐️ 嗎！」
          </p>

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
          <p></p>
          <p></p>
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
import weixinQR from '@/assets/weixin.png' // 微信支付二维码图片
import alipayQR from '@/assets/zfb.jpg' // 支付宝支付二维码图片
import { useRouter } from 'vue-router' // 路由管理

// 控制弹窗显示的开关
const showQRCodes = ref(false)

// 路由管理
const router = useRouter()

// 当前选中的 Tab 页
const currentTab = ref('intro') // 默认选择 "簡介" 页面

// 所有 Tab 页信息
const tabs = [
  { name: 'intro', label: '簡介' },
  { name: 'reflection', label: '感悟' },
  { name: 'suggestion', label: '建議' },
  { name: 'like', label: '喜歡作者' }
]

// 项目的 GitHub 链接和描述
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

// 点击关注按钮时，跳转到知乎页面
function followClicked() {
  window.open('https://www.zhihu.com/people/da-shu-18-11', '_blank');
}

// 切换 Tab 页
const changeTab = (tabName) => {
  currentTab.value = tabName;
}

</script>

<style scoped>
/* === Tabs === */
.tabs-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  min-height: 100dvh;
}
.tabs {
  display: flex;
  justify-content: center;
  gap: 16px;
  overflow-x: auto;
  max-width: 100%;
  padding: 8px 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar {
  display: none;
}
.tab {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 16px;
  cursor: pointer;
  color: #444;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  transition: all 0.5s ease;
  user-select: none;
  border: 1px solid #007aff;
}
.tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #007aff;
}
.tab.active {
  color: #fff;
  background: rgba(0, 122, 255, 0.7);
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
}

/* === 內容區塊 === */
.page {
  padding: 2dvh;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  justify-content: center;
  display: flex;
  margin: 0 auto;
}
@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.thanks-list li {
  margin-bottom: 0.5rem;
}
p {
  font-family: 'Arial', sans-serif; /* 使用清晰的字體 */
  line-height: 1.6; /* 行高，讓文本更通透 */
  font-size: 16px;
  color: #333; /* 深色文字，更易讀 */
  margin-bottom: 20px; /* 每個段落底部的間距 */
}

strong {
  font-weight: bold;
  color: #007aff; /* 強調文字的顏色 */
}

em {
  font-style: italic;
}

p a {
  color: #007aff; /* 超鏈接文字顏色 */
  text-decoration: none; /* 去除下劃線 */
}

p a:hover {
  text-decoration: underline; /* 鼠標懸停時顯示下劃線 */
}

/* 提高段落間距 */
p + p {
  margin-top: 8px;
}

/* 當提到的功能文本是超鏈接時（例如查中古、查音位）可以加入高亮背景 */
p strong {
  background-color: rgba(0, 122, 255, 0.1); /* 淺藍背景 */
  padding: 2px 6px; /* 給強調文字增加內邊距 */
  border-radius: 4px; /* 圓角 */
}

/* 添加 Emoji 樣式 */
p em.emoji {
  font-size: 1.2em; /* 放大 emoji */
  margin-left: 5px;
}
/* 自定義列表樣式 */
.customlist {
  list-style-type: disc;  /* 點狀符號 */
  margin-left: 20px;      /* 左側縮進 */
  padding-left: 20px;     /* 內邊距調整 */
  font-size: 16px;        /* 字體大小 */
  color: #333;            /* 字體顏色 */
}

.customlist ol {
  list-style-type: decimal;  /* 有序列表使用數字 */
}

.customlist ul {
  list-style-type: square;  /* 無序列表使用方塊符號 */
}

/* 自定義列表項目樣式 */
.customlist li {
  margin-bottom: 6px;  /* 每個項目的底部間距 */
  line-height: 1.5;    /* 行高設置 */
  text-align: left; /* 列表文字居左 */
}

.customlist li a {
  color: #007aff;      /* 連結文字顏色 */
  text-decoration: none; /* 去除下劃線 */
}

.customlist li a:hover {
  text-decoration: underline; /* 鼠標懸停顯示下劃線 */
}
/* 整體文字樣式 */
.thoughts p {
  font-family: 'Georgia', serif; /* 優雅的襯線字體 */
  line-height: 1.8; /* 增加行間距，使文本更易讀 */
  font-size: 18px; /* 設置較大的字體 */
  color: #333; /* 深灰色文字 */
  max-width: 800px; /* 限制最大寬度，防止行太長 */
  margin: 40px auto; /* 居中顯示 */
  padding: 20px;
  border-radius: 8px; /* 圓角邊框 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 輕微陰影效果 */
  text-align:left;
}
/* 加強感悟部分的樣式，設置背景色和文字效果 */
.thoughts em {
  font-weight: bold;
  text-decoration: underline;
  color: #000000; /* 橙色文字強調 */
}

/* === 手機響應式 === */
@media (max-width: 600px) {
  .tab {
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 12px;
  }
  .tabs {
    gap: 6px;
    padding: 8px 8px;
  }
  .page {
    padding: 16px;
    font-size: 16px;
  }
  .fancy-run-btn {
    font-size: 16px;
    padding: 10px 20px;
    border-radius: 24px;
  }
  .enter-btn {
    padding: 5px !important;
    font-size: 12px !important;
  }
}

/* 以下是你自定義 dropdown 样式：直接保留即可 */
.dropdown-wrapper {
  flex: 1;
  position: relative;
  align-items: center;
  display: flex;
}
.dropdown {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 14px;
  border: 1px solid rgba(200, 200, 200, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 80px;
  margin: auto;
}
.arrow {
  font-size: 12px;
}
.dropdown-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 10px;
  padding: 6px 0;
  position: absolute;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}
.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}
.dropdown-item:hover {
  background-color: #e6f0ff;
}

/* ✅ Label + Dropdown 水平排列 */
.horizontal-dropdown {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  width: 100%;
  max-width: 300px;
  margin: auto;
}

/* 🍏 Fancy 蘋果風格按鈕，大小對齊 fancy-run-btn */
.allmap-first {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #007aff, mediumblue);
  border: none;
  border-radius: 30px; /* ✔️ same as fancy-run-btn */
  padding: 14px 28px;  /* ✔️ same as fancy-run-btn */
  font-size: 18px;     /* ✔️ same as fancy-run-btn */
  font-weight: bold;   /* ✔️ same */
  letter-spacing: 1px; /* ✔️ same */
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

/* 懸停效果 */
.allmap-first:hover {
  background: linear-gradient(145deg, #4e5d5b, #212d2b);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 12px 32px rgba(0, 0, 0, 0.25);
  transform: translateY(-3px);
}

/* 點擊效果 */
.allmap-first:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 整體文字樣式 */
.thoughts p {
  font-family: 'Georgia', serif; /* 優雅的襯線字體 */
  line-height: 1.8; /* 增加行間距，使文本更易讀 */
  font-size: 18px; /* 設置較大的字體 */
  color: #333; /* 深灰色文字 */
  max-width: 800px; /* 限制最大寬度，防止行太長 */
  margin: 40px auto; /* 居中顯示 */
  padding: 20px;
  border-radius: 8px; /* 圓角邊框 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 輕微陰影效果 */
  text-align:left;
}
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
.suggestion-box {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #1f2937; /* 深灰黑 */
  justify-content: center;
}

.suggestion-box p {
  font-size: 18px;
  color: #6b7280; /* 淺灰 */
  margin: 8px 0;
}

.subtext {
  font-size: 15px;
  color: #9ca3af;
}

.card-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom right, #b7cffa, #ffffff);
  padding: 20px;
  border-radius: 16px;
  text-decoration: none;
  color: black; /* 深藍，用於主內容 */
  font-weight: 600;
  font-size: 18px;
  box-shadow: 0 6px 12px rgba(0, 122, 255, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  backdrop-filter: blur(4px);
  cursor: pointer;
  transform: scale(1);
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 122, 255, 0.2);
  border-color: #007aff;
  background: linear-gradient(to bottom right, #a5c1f6, #ffffff);
}

.card span {
  font-size: 15px;
  color: #003cff; /* Apple 藍 */
  margin-top: 10px;
  text-decoration: underline;
  transition: color 0.3s ease;
}


/* 📱 Mobile Friendly */
@media (max-width: 600px) {
  .card-links {
    gap: 16px;
  }

  .card {
    font-size: 18px; /* 原本是 16px → 加大 */
    padding: 20px;
  }

  .suggestion-box p {
    font-size: 18px; /* 原本是 16px → 加大 */
  }

}

</style>
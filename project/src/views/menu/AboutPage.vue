<template>
  <div class="about-page-wrapper">
    <TabsContainer
      :tabs="tabs"
      default-tab="intro"
    >
    <template #default="{ currentTab }">
      <!-- 新的"簡介"页面 -->
      <div v-if="currentTab === 'intro'" class="thanks-container">
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

      <!-- 新的"感悟"页面 -->
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

      <!-- 新的"建議"页面 -->
      <div v-if="currentTab === 'suggestion'" class="page2">
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

      <!-- 新的"喜歡"页面 -->
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
    </template>
  </TabsContainer>

  <!-- 二维码弹窗 - 使用 Teleport 传送到 body -->
  <Teleport to="body">
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
          </div>
          <div class="qr-box">
            <img :src="alipayQR" alt="支付寶收款碼" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import weixinQR from '@/assets/weixin.png'
import alipayQR from '@/assets/zfb.jpg'
import TabsContainer from '@/components/common/TabsContainer.vue'

const showQRCodes = ref(false)

const tabs = [
  { name: 'intro', label: '簡介' },
  { name: 'reflection', label: '感悟' },
  { name: 'suggestion', label: '建議' },
  { name: 'like', label: '喜歡作者' },
]

const projects = [
  {
    name: 'dialects-vue-frontend',
    url: 'https://github.com/jengzang/dialects-vue-frontend',
    description: '前端倉庫 - 使用vue框架和原生js開發'
  },
  {
    name: 'dialects-backend',
    url: 'https://github.com/jengzang/dialects-backend',
    description: '後端倉庫 - 基於fastapi'
  },
  {
    name: 'dialects-build',
    url: 'https://github.com/jengzang/dialects-build',
    description: '字表預處理倉庫 - 提取字表的聲韻調'
  },
]

function followClicked() {
  window.open('https://www.zhihu.com/people/da-shu-18-11', '_blank');
}
</script>

<style scoped>
.about-page-wrapper {
  width: 100%;
  height: 100%;
}

/* === 內容區塊 === */
.page2 {
  padding: 1dvw 8dvw;
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
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}

strong {
  font-weight: bold;
  color: #007aff;
}

em {
  font-style: italic;
}

p a {
  color: #007aff;
  text-decoration: none;
}

p a:hover {
  text-decoration: underline;
}

p + p {
  margin-top: 8px;
}

p strong {
  background-color: rgba(0, 122, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

p em.emoji {
  font-size: 1.2em;
  margin-left: 5px;
}

.customlist {
  list-style-type: disc;
  margin-left: 20px;
  padding-left: 20px;
  font-size: 16px;
  color: #333;
}

.customlist ol {
  list-style-type: decimal;
}

.customlist ul {
  list-style-type: square;
}

.customlist li {
  margin-bottom: 6px;
  line-height: 1.5;
  text-align: left;
}

.customlist li a {
  color: #007aff;
  text-decoration: none;
}

.customlist li a:hover {
  text-decoration: underline;
}

.thoughts p {
  font-family: 'Georgia', serif;
  line-height: 1.8;
  font-size: 18px;
  color: #333;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align:left;
}

.thoughts em {
  font-weight: bold;
  text-decoration: underline;
  color: #000000;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  text-align: center;
  max-width: 800px;
}

.project-card {
  position: relative;
  display: block;
  flex: 1 1 280px;
  max-width: 320px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.1rem;
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  z-index: 0;
  border: 2px solid transparent;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
}

.project-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 0 12px rgba(63, 142, 255, 0.2);
}

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
  color: #3f8eff;
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
  background-color: #c52f27;
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

@media (max-width: 600px) {
  .project-card {
    padding: 1.2rem;
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
  overflow: auto;
}

.qr-modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.qr-title {
  margin: 0;
  font-size: 1.5rem;
  color: #ff3b30;
}

.qr-subtitle {
  margin: 0.5rem 0 1.5rem;
  font-size: 1rem;
  color: #666;
}

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
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.qr-box img:hover {
  transform: scale(1.2);
}

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
  color: #1f2937;
  justify-content: center;
}

.suggestion-box p {
  font-size: 18px;
  color: #6b7280;
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
  color: black;
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
  color: #003cff;
  margin-top: 10px;
  text-decoration: underline;
  transition: color 0.3s ease;
}

@media (max-width: 600px) {
  .card-links {
    gap: 16px;
  }

  .card {
    font-size: 18px;
    padding: 20px;
  }

  .suggestion-box p {
    font-size: 18px;
  }
}

</style>

<template>
  <div class="home-page">
    <!-- Animated Background -->
    <div class="bg-gradient"></div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <img src="@/assets/title.png" alt="方音圖鑑" class="hero-logo" />
        <h1 class="hero-title">方言比較 · 地理語言學</h1>
        <p class="hero-subtitle">✨ 探索方言的歷史層次 · 🎵 觸摸漢字的音韻之美</p>
        <div class="hero-actions">
          <button class="btn-primary" @click="navigateTo('/menu?tab=query')">
            <span class="btn-icon">🚀</span>
            <span class="btn-text">開始探索</span>
          </button>
          <!-- <button class="btn-primary btn-explore" @click="navigateTo('/explore?page=YuBao')">
            <span class="btn-icon">🧰</span>
            <span class="btn-text">拓展工具</span>
          </button> -->
          <button class="btn-secondary" @click="scrollToFeatures">
            <span class="btn-icon">📖</span>
            <span class="btn-text">功能簡介</span>
          </button>
        </div>
        <img src="@/assets/BlueCircle.png" alt="Blue Circle" class="hero-decoration" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section" ref="featuresSection">
      <h2 class="section-title">核心功能</h2>

      <div class="features-grid">
        <!-- 查詢功能 -->
        <div class="feature-card" :class="{ expanded: expandedCard === 'query' }">
          <div class="card-header" @click="toggleCard('query')">
            <div class="card-icon">🔍</div>
            <div class="card-info">
              <h3 class="card-title">查詢分析</h3>
              <p class="card-desc">多維度查詢方言音韻資料</p>
            </div>
            <button class="expand-toggle">
              <span class="toggle-icon">{{ expandedCard === 'query' ? '−' : '+' }}</span>
            </button>
          </div>
          <transition name="expand">
            <div v-if="expandedCard === 'query'" class="card-body">
              <a @click.stop="navigateTo('/menu?tab=query&sub=tab1')" class="feature-link">
                <span class="link-icon">📝</span>
                <span class="link-text">查字 - 查詢字音、地位</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=query&sub=tab2')" class="feature-link">
                <span class="link-icon">📜</span>
                <span class="link-text">查中古 - 按中古地位整理讀音</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=query&sub=tab3')" class="feature-link">
                <span class="link-icon">🗣️</span>
                <span class="link-text">查音位 - 分析音位的中古來源</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=query&sub=tab4')" class="feature-link">
                <span class="link-icon">🎶</span>
                <span class="link-text">查調 - 查詢調值、調類</span>
              </a>
            </div>
          </transition>
        </div>

        <!-- 比較功能 -->
        <div class="feature-card" :class="{ expanded: expandedCard === 'compare' }">
          <div class="card-header" @click="toggleCard('compare')">
            <div class="card-icon">⚖️</div>
            <div class="card-info">
              <h3 class="card-title">方言比較</h3>
              <p class="card-desc">對比不同方言的音韻特徵</p>
            </div>
            <button class="expand-toggle">
              <span class="toggle-icon">{{ expandedCard === 'compare' ? '−' : '+' }}</span>
            </button>
          </div>
          <transition name="expand">
            <div v-if="expandedCard === 'compare'" class="card-body">
              <a @click.stop="navigateTo('/menu?tab=compare&sub=tab1')" class="feature-link">
                <span class="link-icon">📊</span>
                <span class="link-text">比較漢字 - 對比字音差異</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=compare&sub=tab2')" class="feature-link">
                <span class="link-icon">🎯</span>
                <span class="link-text">比較中古 - 對比中古音演變</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=compare&sub=tab4')" class="feature-link">
                <span class="link-icon">🎹</span>
                <span class="link-text">比較調類 - 對比聲調系統</span>
              </a>
            </div>
          </transition>
        </div>

        <!-- 地圖可視化 -->
        <div class="feature-card" :class="{ expanded: expandedCard === 'map' }">
          <div class="card-header" @click="toggleCard('map')">
            <div class="card-icon">🗺️</div>
            <div class="card-info">
              <h3 class="card-title">地圖可視化</h3>
              <p class="card-desc">地理語言學視角呈現</p>
            </div>
            <button class="expand-toggle">
              <span class="toggle-icon">{{ expandedCard === 'map' ? '−' : '+' }}</span>
            </button>
          </div>
          <transition name="expand">
            <div v-if="expandedCard === 'map'" class="card-body">
              <a @click.stop="navigateTo('/menu?tab=map')" class="feature-link">
                <span class="link-icon">📍</span>
                <span class="link-text">方言地圖 - 地圖上呈現查詢結果</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=map&sub=divide')" class="feature-link">
                <span class="link-icon">🎨</span>
                <span class="link-text">分區繪圖 - 按分區繪製方言地圖</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=map&sub=custom')" class="feature-link">
                <span class="link-icon">✏️</span>
                <span class="link-text">自定義繪圖 - 添加個人數據繪圖</span>
              </a>
            </div>
          </transition>
        </div>

        <!-- 音系分析 -->
        <div class="feature-card" :class="{ expanded: expandedCard === 'pho' }">
          <div class="card-header" @click="toggleCard('pho')">
            <div class="card-icon">🧬</div>
            <div class="card-info">
              <h3 class="card-title">音系分析</h3>
              <p class="card-desc">方言音系結構研究</p>
            </div>
            <button class="expand-toggle">
              <span class="toggle-icon">{{ expandedCard === 'pho' ? '−' : '+' }}</span>
            </button>
          </div>
          <transition name="expand">
            <div v-if="expandedCard === 'pho'" class="card-body">
              <a @click.stop="navigateTo('/menu?tab=pho&sub=phonologyMatrix')" class="feature-link">
                <span class="link-icon">⚗️</span>
                <span class="link-text">音系查詢 - 查看方言音系表</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=pho&sub=phonologyCustom')" class="feature-link">
                <span class="link-icon">🔬</span>
                <span class="link-text">音素分類 - 自定義音素分類</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=pho&sub=Countphos')" class="feature-link">
                <span class="link-icon">📊</span>
                <span class="link-text">音節統計 - 統計音節數量</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=pho&sub=ZhongGu')" class="feature-link">
                <span class="link-icon">✍️</span>
                <span class="link-text">中古地位 - 查詢漢字中古地位</span>
              </a>
            </div>
          </transition>
        </div>

        <!-- 詞句資料 -->
        <div class="feature-card" :class="{ expanded: expandedCard === 'words' }">
          <div class="card-header" @click="toggleCard('words')">
            <div class="card-icon">📖</div>
            <div class="card-info">
              <h3 class="card-title">詞句資料</h3>
              <p class="card-desc">方言詞彙與語法資料</p>
            </div>
            <button class="expand-toggle">
              <span class="toggle-icon">{{ expandedCard === 'words' ? '−' : '+' }}</span>
            </button>
          </div>
          <transition name="expand">
            <div v-if="expandedCard === 'words'" class="card-body">
              <a @click.stop="navigateTo('/explore?page=YuBao&sub=vocabulary')" class="feature-link">
                <span class="link-icon">📚</span>
                <span class="link-text">語保詞彙 - 語保工程詞彙資料</span>
              </a>
              <a @click.stop="navigateTo('/explore?page=YuBao&sub=grammar')" class="feature-link">
                <span class="link-icon">🗣️</span>
                <span class="link-text">語保語法 - 語保工程句子資料</span>
              </a>
              <a @click.stop="navigateTo('/explore?page=ycSpoken')" class="feature-link">
                <span class="link-icon">💬</span>
                <span class="link-text">陽春口語詞 - 陽春方言口語詞彙</span>
              </a>
            </div>
          </transition>
        </div>

        <!-- 自然村資料 -->
        <div class="feature-card" :class="{ expanded: expandedCard === 'villages' }">
          <div class="card-header" @click="toggleCard('villages')">
            <div class="card-icon">🏘️</div>
            <div class="card-info">
              <h3 class="card-title">自然村資料</h3>
              <p class="card-desc">村落地名分析與方言繪圖</p>
            </div>
            <button class="expand-toggle">
              <span class="toggle-icon">{{ expandedCard === 'villages' ? '−' : '+' }}</span>
            </button>
          </div>
          <transition name="expand">
            <div v-if="expandedCard === 'villages'" class="card-body">
              <a @click.stop="navigateTo('/explore?page=gdVillages')" class="feature-link">
                <span class="link-icon">🏘️</span>
                <span class="link-text">廣東自然村 - 廣東自然村樹狀圖</span>
              </a>
              <a @click.stop="navigateTo('/explore?page=VillagesML')" class="feature-link">
                <span class="link-icon">🤖</span>
                <span class="link-text">機器學習 - 自然村名機器學習</span>
              </a>
              <a @click.stop="navigateTo('/explore?page=gdVillagesTable')" class="feature-link">
                <span class="link-icon">📊</span>
                <span class="link-text">全粵村情表格 - 廣東村落詳細表格</span>
              </a>
              <a @click.stop="navigateTo('/explore?page=ycVillages')" class="feature-link">
                <span class="link-icon">🌾</span>
                <span class="link-text">陽春自然村 - 陽春自然村資料</span>
              </a>
            </div>
          </transition>
        </div>

        <!-- 專業工具 -->
        <div class="feature-card" :class="{ expanded: expandedCard === 'tools' }">
          <div class="card-header" @click="toggleCard('tools')">
            <div class="card-icon">🧰</div>
            <div class="card-info">
              <h3 class="card-title">字表工具</h3>
              <p class="card-desc">字表轉換、合併、檢查等工具</p>
            </div>
            <button class="expand-toggle">
              <span class="toggle-icon">{{ expandedCard === 'tools' ? '−' : '+' }}</span>
            </button>
          </div>
          <transition name="expand">
            <div v-if="expandedCard === 'tools'" class="card-body">
              <a @click.stop="navigateTo('/explore?page=check')" class="feature-link">
                <span class="link-icon">📋</span>
                <span class="link-text">字表處理 - 字表檢查與格式轉換</span>
              </a>
              <a @click.stop="navigateTo('/explore?page=jyut2ipa')" class="feature-link">
                <span class="link-icon">🔤</span>
                <span class="link-text">粵拼轉IPA - 粵拼轉國際音標</span>
              </a>
              <a @click.stop="navigateTo('/explore?page=merge')" class="feature-link">
                <span class="link-icon">🔗</span>
                <span class="link-text">字表合併 - 合併多個字表</span>
              </a>
              <!-- <a @click.stop="navigateTo('/explore?page=praat')" class="feature-link">
                <span class="link-icon">🎙️</span>
                <span class="link-text">聲學分析 - 實驗語音學工具</span>
              </a> -->
            </div>
          </transition>
        </div>

        <!-- Praat 聲學分析 -->
        <div class="feature-card clickable" @click="navigateTo('/explore?page=praat')">
          <div class="card-header">
            <div class="card-icon">🎙️</div>
            <div class="card-info">
              <h3 class="card-title">Praat 聲學分析</h3>
              <p class="card-desc">實驗語音學工具與數據分析</p>
            </div>
            <div class="card-arrow">→</div>
          </div>
        </div>

        <!-- 關於網站 -->
        <div class="feature-card" :class="{ expanded: expandedCard === 'about' }">
          <div class="card-header" @click="toggleCard('about')">
            <div class="card-icon">🌐</div>
            <div class="card-info">
              <h3 class="card-title">關於網站</h3>
              <p class="card-desc">網站介紹與資料來源</p>
            </div>
            <button class="expand-toggle">
              <span class="toggle-icon">{{ expandedCard === 'about' ? '−' : '+' }}</span>
            </button>
          </div>
          <transition name="expand">
            <div v-if="expandedCard === 'about'" class="card-body">
              <a @click.stop="navigateTo('/menu?tab=about&sub=intro')" class="feature-link">
                <span class="link-icon">ℹ️</span>
                <span class="link-text">簡介 - 網站功能介紹</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=about&sub=reflection')" class="feature-link">
                <span class="link-icon">🙏</span>
                <span class="link-text">感悟 - 開發感悟與鳴謝</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=about&sub=suggestion')" class="feature-link">
                <span class="link-icon">💬</span>
                <span class="link-text">提出建議 - 反饋與建議</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=about&sub=like')" class="feature-link">
                <span class="link-icon">❤️</span>
                <span class="link-text">喜歡作者 - 支持與關注</span>
              </a>
              <a @click.stop="navigateTo('/menu?tab=source')" class="feature-link">
                <span class="link-icon">📚</span>
                <span class="link-text">資料來源 - 查閱字表來源與相關信息</span>
              </a>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- Roadmap Section -->
    <section class="roadmap-section">
      <h2 class="section-title">開發中的功能</h2>
      <p class="section-subtitle">即將推出的新特性</p>
      <div class="roadmap-list">
        <div class="roadmap-item">
          <div class="roadmap-header">
            <div class="roadmap-icon">🎙️</div>
            <h3 class="roadmap-title">韶子的語音學工具箱</h3>
          </div>
          <p class="roadmap-desc">聲學參數批量估計、多算法基頻檢測、EGG信號分析、聲門參數提取</p>
        </div>
        <div class="roadmap-item">
          <div class="roadmap-header">
            <div class="roadmap-icon">🧬</div>
            <h3 class="roadmap-title">方言聚類分析</h3>
          </div>
          <p class="roadmap-desc">自定義音值音位權重、調整聚類算法參數、基於音位向量的多維度相似度計算</p>
        </div>
        <div class="roadmap-item">
          <div class="roadmap-header">
            <div class="roadmap-icon">🌳</div>
            <h3 class="roadmap-title">方言演化樹狀圖</h3>
          </div>
          <p class="roadmap-desc">自定義演化模型參數、調整分支長度算法、交互式系統發生樹構建與可視化</p>
        </div>
        <div class="roadmap-item">
          <div class="roadmap-header">
            <div class="roadmap-icon">🔊</div>
            <h3 class="roadmap-title">IPA 轉語音合成</h3>
          </div>
          <p class="roadmap-desc">國際音標到語音的實時轉換、多方言音色支持</p>
        </div>
        <div class="roadmap-item">
          <div class="roadmap-header">
            <div class="roadmap-icon">🤖</div>
            <h3 class="roadmap-title">方言對話機器人</h3>
          </div>
          <p class="roadmap-desc">基於規整字表集的LLM微調、音色克隆、方言語音交互（遠景規劃）</p>
        </div>
      </div>
    </section>

    <!-- Login Benefits Section -->
    <section class="login-section">
      <div class="login-card">
        <div class="login-icon">🔐</div>
        <div class="login-content">
          <h3 class="login-title">登錄解鎖更多功能</h3>
          <p class="login-desc">查看詳細權限對比，了解登錄後的完整權益</p>
          <div class="login-benefits">
            <div class="benefit-item">
              <span class="benefit-icon">🗺️</span>
              <span class="benefit-text">自定義繪製地圖</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🗂️</span>
              <span class="benefit-text">自定義方言分區</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🔍</span>
              <span class="benefit-text">查詢地點數量提升</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🎙️</span>
              <span class="benefit-text">Praat 聲學工具</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🧰</span>
              <span class="benefit-text">字表處理工具</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📊</span>
              <span class="benefit-text">查詢記錄與排行榜</span>
            </div>
          </div>
        </div>
        <div class="login-actions">
          <button class="login-btn primary" @click="navigateTo('/auth')">
            立即登錄
          </button>
          <button class="login-btn secondary" @click="showBenefitsPopup = true">
            查看詳情
          </button>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section class="projects-section">
      <h2 class="section-title">開源項目</h2>
      <p class="section-subtitle">歡迎 Star ⭐ Fork 🍴 貢獻代碼</p>
      <div class="projects-grid">
        <a
          v-for="project in projects"
          :key="project.name"
          :href="project.url"
          target="_blank"
          rel="noopener noreferrer"
          class="project-card"
        >
          <div class="project-icon">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>
          <div class="project-content">
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-desc">{{ project.description }}</p>
          </div>
          <div class="project-arrow">→</div>
        </a>
      </div>

      <div class="contact-card">
        <div class="contact-icon">💬</div>
        <div class="contact-content">
          <h3 class="contact-title">聯繫作者</h3>
          <p class="contact-desc">關注知乎，了解更多方言研究與GIS知識</p>
        </div>
        <button class="contact-btn" @click="openZhihu">
          前往知乎
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a @click="navigateTo('/menu?tab=about')" class="footer-link">關於網站</a>
          <span class="footer-divider">·</span>
          <a @click="navigateTo('/menu?tab=source')" class="footer-link">資料來源</a>
          <span class="footer-divider">·</span>
          <a @click="navigateTo('/menu?tab=privacy')" class="footer-link">隱私政策</a>
          <span class="footer-divider">·</span>
          <a @click="navigateTo('/menu?tab=setting')" class="footer-link">設置</a>
          <span class="footer-divider">·</span>
          <a href="https://dialects.yzup.top/detail/" target="_blank" class="footer-link">舊版網站</a>
          <span class="footer-divider">·</span>
          <a @click="showSupport = true" class="footer-link">支持作者</a>
        </div>

        <!-- Visit Stats -->
        <div class="footer-stats">
          <span class="stat-text">今日訪問 {{ todayVisits }} · 總訪問 {{ totalVisits }}</span>
        </div>

        <div class="footer-info">
          <p class="footer-text">© 2026 方音圖鑑 · 由不羈(jengzang)開發</p>
          <p class="footer-text">{{ CURRENT_VERSION }} · 最後更新：{{ LAST_UPDATE_DATE }}</p>
          <p class="footer-text">粵ICP備2025466875號</p>
        </div>
      </div>
    </footer>

    <!-- User Benefits Popup -->
    <UserBenefitsPopup
      :visible="showBenefitsPopup"
      @close="showBenefitsPopup = false"
      @register="navigateTo('/auth')"
    />

    <!-- Update Notice Modal -->
    <UpdateNoticeModal
      :visible="showUpdateNotice"
      version="v4.1.0"
      title="🎊 網站更新通知"
      @close="showUpdateNotice = false"
    >
      <div class="update-item">
        <span class="item-icon">🏠</span>
        <span class="item-text"><strong>全新首頁</strong> - 採用液態玻璃風格設計，展示核心功能卡片、開源項目、登錄權益等，提供更直觀的導航體驗</span>
      </div>
      <div class="update-item">
        <span class="item-icon">⚖️</span>
        <span class="item-text"><strong>方言比較功能</strong> - 支持漢字比較、中古音比較、調類比較，地圖用不同顏色的圓點展示兩組數據的差異，並提供圖例說明</span>
      </div>
      <div class="update-item">
        <span class="item-icon">🤖</span>
        <span class="item-text"><strong>自然村機器學習分析</strong> - 新增村落方言數據的機器學習分析功能，幫助研究者發現方言分布的潛在規律和模式</span>
      </div>
    </UpdateNoticeModal>

    <!-- Support Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showSupport" class="modal-overlay" @click="showSupport = false">
          <div class="modal-content" @click.stop>
            <button class="modal-close" @click="showSupport = false">✕</button>
            <h3 class="modal-title">☕️ 請作者喝杯咖啡</h3>
            <p class="modal-subtitle">感謝您的支持！💖</p>
            <div class="donate-qr-grid">
              <div class="donate-qr-box">
                <img src="@/assets/weixin.png" alt="微信收款碼" />
                <p class="donate-qr-label">微信</p>
              </div>
              <div class="donate-qr-box">
                <img src="@/assets/zfb.jpg" alt="支付寶收款碼" />
                <p class="donate-qr-label">支付寶</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { getTodayVisits, getTotalVisits } from '@/api/logs/index.js'

// ✅ 条件渲染的组件懒加载
const UserBenefitsPopup = defineAsyncComponent(() =>
  import('@/components/user/UserBenefitsPopup.vue')
)
const UpdateNoticeModal = defineAsyncComponent(() =>
  import('@/components/UpdateNoticeModal.vue')
)

const router = useRouter()
const featuresSection = ref(null)
const expandedCard = ref(null)
const showSupport = ref(false)
const showBenefitsPopup = ref(false)
const showUpdateNotice = ref(false)
const todayVisits = ref(0)
const totalVisits = ref(0)

// 当前版本号和更新时间
const CURRENT_VERSION = 'v4.1.0'
const LAST_UPDATE_DATE = '2026-03-06'

const projects = [
  {
    name: 'dialects-vue-frontend',
    url: 'https://github.com/jengzang/dialects-vue-frontend',
    description: '前端倉庫 - 使用vue框架開發'
  },
  {
    name: 'dialects-backend',
    url: 'https://github.com/jengzang/dialects-backend',
    description: '後端倉庫 - 基於fastapi'
  },
  {
    name: 'dialects-build',
    url: 'https://github.com/jengzang/dialects-build',
    description: '字表預處理倉庫 - 提取字表的聲韻調並規整數據'
  },
  {
    name: 'villages-ML',
    url: 'https://github.com/jengzang/villages-ML',
    description: '自然村機器學習 - 村落名稱、地理數據分析'
  }
]

function navigateTo(path) {
  router.push(path)
}

function scrollToFeatures() {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function toggleCard(cardName) {
  expandedCard.value = expandedCard.value === cardName ? null : cardName
}

function openZhihu() {
  window.open('https://www.zhihu.com/people/da-shu-18-11', '_blank')
}

// Fetch visit statistics
async function fetchVisitStats() {
  try {
    const [todayData, totalData] = await Promise.all([
      getTodayVisits(),
      getTotalVisits()
    ])
    todayVisits.value = todayData?.today_visits || 0
    totalVisits.value = totalData?.total_visits || 0
  } catch (error) {
    console.error('獲取訪問統計失敗:', error)
  }
}

// Check if should show update notice
function checkUpdateNotice() {
  const dismissedVersions = JSON.parse(localStorage.getItem('update-notice-dismissed') || '[]')
  if (!dismissedVersions.includes(CURRENT_VERSION)) {
    showUpdateNotice.value = true
  }
}

onMounted(() => {
  fetchVisitStats()
  checkUpdateNotice()
})
</script>

<style scoped>
/* Base */
.home-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #e0e6f6 0%, #f5f7fa 100%);
  width: 90dvw;
  margin: 0 auto;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.12);
}

.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 20% 30%, rgba(0, 122, 255, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 95, 211, 0.08) 0%, transparent 50%);
  /* 移除动画以提升性能 */
}

/* Hero */
.hero-section {
  position: relative;
  z-index: 1;
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.hero-content {
  text-align: center;
  max-width: 700px;
  animation: heroFadeIn 1s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes heroFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-logo {
  width: clamp(220px, 40vw, 380px);
  height: auto;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 12px rgba(0, 122, 255, 0.15));
  /* 移除浮动动画以提升性能 */
}

.hero-title {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  color: rgba(0, 122, 255, 0.85);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.hero-subtitle {
  font-size: clamp(0.95rem, 2vw, 1.25rem);
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 2.5rem;
  line-height: 1.5;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.hero-decoration {
  max-height: 100px;
  width: auto;
  opacity: 0.9;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.btn-primary, .btn-secondary {
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

.btn-primary.btn-explore {
  background: linear-gradient(135deg, #34c759 0%, #28a745 100%);
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 122, 255, 0.4);
}

.btn-primary.btn-explore:hover {
  box-shadow: 0 6px 24px rgba(52, 199, 89, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: #007aff;
  border: 1.5px solid rgba(0, 122, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 122, 255, 0.5);
  transform: translateY(-2px);
}

/* Features */
.features-section {
  position: relative;
  z-index: 1;
  padding: clamp(3rem, 8vw, 6rem) clamp(1.5rem, 4vw, 2.5rem);
  max-width: 1300px;
  margin: 0 auto;
}

.section-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #007aff;
}

.section-subtitle {
  text-align: center;
  font-size: 0.9375rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2rem;
  font-weight: 500;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));
  gap: 1.25rem;
  align-items: start;
}

.feature-card {
  background: rgba(255, 255, 255, 0.7);
  /* 移除 backdrop-filter 以大幅提升性能 */
  border-radius: 16px;
  border: 1px solid rgba(0, 122, 255, 0.15);
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.08);
  /* 简化入场动画 */
  animation: cardFadeIn 0.4s ease backwards;
}

.feature-card:nth-child(1) { animation-delay: 0.02s; }
.feature-card:nth-child(2) { animation-delay: 0.04s; }
.feature-card:nth-child(3) { animation-delay: 0.06s; }
.feature-card:nth-child(4) { animation-delay: 0.08s; }
.feature-card:nth-child(5) { animation-delay: 0.1s; }
.feature-card:nth-child(6) { animation-delay: 0.12s; }
.feature-card:nth-child(7) { animation-delay: 0.14s; }
.feature-card:nth-child(8) { animation-delay: 0.16s; }
.feature-card:nth-child(9) { animation-delay: 0.18s; }

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.15);
  border-color: rgba(0, 122, 255, 0.3);
  background: rgba(255, 255, 255, 0.85);
}

.feature-card.expanded {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 122, 255, 0.35);
  box-shadow: 0 6px 18px rgba(0, 122, 255, 0.18);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.card-header:hover {
  background: rgba(0, 122, 255, 0.03);
}

.card-header:active {
  transform: scale(0.98);
}

.card-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 95, 211, 0.15) 100%);
  border-radius: 12px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.feature-card:hover .card-icon {
  transform: scale(1.2);
}

.feature-card.expanded .card-icon {
  transform: scale(1.1);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.25rem;
}

.card-desc {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.card-arrow {
  font-size: 1.5rem;
  color: #007aff;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.feature-card.clickable {
  cursor: pointer;
}

.feature-card.clickable:hover .card-arrow {
  transform: translateX(6px);
}

.expand-toggle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #007aff;
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.expand-toggle:hover {
  background: rgba(0, 122, 255, 0.2);
  transform: scale(1.1);
}

.feature-card.expanded .expand-toggle {
  background: #007aff;
  color: white;
  transform: rotate(180deg);
}

.feature-card.expanded .expand-toggle:hover {
  transform: rotate(180deg) scale(1.1);
}

.card-body {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(0, 122, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.feature-link::after {
  content: '→';
  margin-left: auto;
  color: rgba(0, 122, 255, 0.6);
  font-size: 1.4rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.feature-link:hover {
  background: rgba(0, 122, 255, 0.08);
  border-color: rgba(0, 122, 255, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

.feature-link:hover::after {
  color: rgba(0, 122, 255, 1);
  transform: translateX(3px);
}

.link-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.feature-link:hover .link-icon {
  transform: scale(1.1);
}

.link-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1d1d1f;
  transition: color 0.2s ease;
}

.feature-link:hover .link-text {
  color: #007aff;
}

.expand-enter-active, .expand-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: opacity, transform;
}

.expand-enter-from, .expand-leave-to {
  opacity: 0;
  transform: translateY(-10px) scaleY(0.95);
}

.expand-enter-to, .expand-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}

.card-body {
  transform-origin: top;
}

/* Roadmap */
.roadmap-section {
  position: relative;
  z-index: 1;
  padding: clamp(2rem, 6vw, 4rem) clamp(1.5rem, 4vw, 2.5rem);
  max-width: 1100px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(240, 248, 255, 0.6) 100%);
  border-radius: 20px;
}

.roadmap-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 1rem;
}

.roadmap-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 122, 255, 0.12);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.roadmap-item:hover {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(0, 122, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.08);
}

.roadmap-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.roadmap-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 95, 211, 0.12) 100%);
  border-radius: 8px;
}

.roadmap-content {
  flex: 1;
  min-width: 0;
}

.roadmap-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #007aff;
  margin: 0;
}

.roadmap-desc {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.5;
  margin: 0;
}

/* Projects */
.projects-section {
  position: relative;
  z-index: 1;
  padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 2.5rem) clamp(3rem, 8vw, 6rem);
  max-width: 1300px;
  margin: 0 auto;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.project-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 14px;
  border: 1px solid rgba(0, 122, 255, 0.15);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.08);
  will-change: transform;
}

.project-card:hover {
  transform: translateY(-3px) scale(1.02);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 32px rgba(0, 122, 255, 0.18);
  border-color: rgba(0, 122, 255, 0.3);
}

.project-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
}

.project-icon svg {
  width: 20px;
  height: 20px;
  color: #007aff;
}

.project-content {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.2rem;
}

.project-desc {
  font-size: 0.8125rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.project-arrow {
  flex-shrink: 0;
  font-size: 1.25rem;
  color: #007aff;
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .project-arrow {
    display: none;
  }
}

.project-card:hover .project-arrow {
  transform: translateX(4px);
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 95, 211, 0.08) 100%);
  /* 移除 backdrop-filter */
  border-radius: 16px;
  border: 1px solid rgba(0, 122, 255, 0.2);
  transition: all 0.25s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.18);
  border-color: rgba(0, 122, 255, 0.3);
}

.contact-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.contact-content {
  flex: 1;
  min-width: 0;
}

.contact-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.25rem;
}

.contact-desc {
  font-size: 0.9375rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.contact-btn {
  padding: 0.75rem 1.75rem;
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
  flex-shrink: 0;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35);
}

/* Login Section */
.login-section {
  position: relative;
  z-index: 1;
  padding: clamp(3rem, 8vw, 6rem) clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 2.5rem);
  max-width: 1300px;
  margin: 0 auto;
}

.login-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 95, 211, 0.05) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1.5px solid rgba(0, 122, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.1);
}

.login-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 122, 255, 0.18);
  border-color: rgba(0, 122, 255, 0.3);
}

.login-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.login-content {
  flex: 1;
  min-width: 0;
}

.login-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #007aff;
  margin-bottom: 0.5rem;
}

.login-desc {
  font-size: 0.9375rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.login-benefits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1d1d1f;
  font-weight: 500;
}

.benefit-icon {
  font-size: 1.125rem;
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
}

.login-btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  white-space: nowrap;
}

.login-btn.primary {
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

.login-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 122, 255, 0.4);
}

.login-btn.secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #007aff;
  border: 1.5px solid rgba(0, 122, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
}

.login-btn.secondary:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 122, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.2);
}

/* Footer */
.footer {
  position: relative;
  z-index: 1;
  padding: 2.5rem clamp(1.5rem, 4vw, 2.5rem);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 122, 255, 0.1);
}

.footer-content {
  max-width: 1300px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.875rem;
  margin-bottom: 1.25rem;
}

.footer-link {
  font-size: 0.9375rem;
  color: #007aff;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.footer-link:hover {
  color: #005ecb;
  background: rgba(0, 122, 255, 0.08);
  text-decoration: underline;
}

.footer-divider {
  color: rgba(0, 122, 255, 0.3);
  font-weight: 300;
}

.footer-stats {
  margin-bottom: 0.75rem;
  text-align: center;
}

.stat-text {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.footer-text {
  font-size: 0.8125rem;
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
}

.modal-content {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.6);
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #007aff;
}

.modal-subtitle {
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2rem;
}

.donate-qr-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.donate-qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donate-qr-box img {
  width: 100%;
  max-width: 150px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.donate-qr-box img:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.donate-qr-label {
  margin-top: 0.625rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content, .modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Responsive */
@media (orientation: portrait) {
  .hero-section { min-height: 75vh; }
  .hero-logo {
    width: clamp(260px, 50vw, 400px);
  }
  .hero-actions{
    gap: 0.75rem;
    align-items: center;
  }
  .features-grid, .projects-grid { grid-template-columns: 1fr; }
  .projects-grid { gap: 0.75rem; }
  .project-card {
    flex-direction: column;
    text-align: center;
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }
  .project-name{
    margin:0;
  }
  .contact-card {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
    gap:10px;
  }
  .contact-title{
    margin:0;
  }
  .login-card { 
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap:10px;
  }
  .login-title{
    margin:0;
  }
  .login-benefits {
    grid-template-columns: 1fr;
  }
  .login-actions {
    width: 100%;
  }
  .footer-links {  gap: 0.625rem; }
  .footer-divider { display: none; }

  /* Modal 移動端優化 */
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    padding: 2rem 1.5rem;
    width: auto;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .donate-qr-box img {
    max-width: 120px;
  }
}

@media (max-width: 600px) {
  .btn-primary, .btn-secondary { padding: 0.75rem 1.75rem; font-size: 0.9375rem; }
  .card-header { padding: 1rem; }
  .card-body { padding: 0 1rem 1rem; }
  .card-title { font-size: 1.0625rem; }
  .card-icon { width: 44px; height: 44px; font-size: 1.75rem; }
  .projects-grid { gap: 0.625rem; }
  .project-card {
    padding: 0.75rem 0.875rem;
    gap: 0.625rem;
  }
  .login-card {
    padding: 1.25rem;
  }
  .login-title {
    font-size: 1.125rem;
  }
  .login-desc {
    font-size: 0.875rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .hero-logo { animation: none; }
}
</style>

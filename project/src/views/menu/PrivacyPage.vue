<script setup>
import { ref } from 'vue'

const currentLang = ref('zh')

const toggleLang = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
}
</script>

<template>
  <div class="privacy-container">
    <div class="privacy-content glass-container">
      <!-- 标题和语言切换 -->
      <div class="header">
        <h1 class="title">{{ currentLang === 'zh' ? '📜 隱私政策與引用說明' : '📜 Privacy Policy & Citation' }}</h1>
        <button class="lang-toggle" @click="toggleLang">
          {{ currentLang === 'zh' ? 'English' : '中文' }}
        </button>
      </div>

      <!-- 中文版 -->
      <div v-if="currentLang === 'zh'" class="content-section">
        <!-- 引用建议 -->
        <section class="section">
          <h2>📖 引用建議</h2>
          <div class="citation-box">
            <p class="citation-text">
              楊錚，2026，方音圖鑑。查詢網址 <a href="https://dialects.yzup.top" target="_blank">https://dialects.yzup.top</a>
            </p>
            <button class="copy-btn" @click="() => {
              navigator.clipboard.writeText('楊錚，2026，方音圖鑑。查詢網址 https://dialects.yzup.top')
              alert('已複製到剪貼板！')
            }">
              📋 複製引用
            </button>
          </div>
          <p class="note">
            若您在學術論文、研究報告或其他出版物中使用本網站資料，請按照上述格式進行引用。
          </p>
        </section>

        <!-- 隐私政策 -->
        <section class="section">
          <h2>🔒 隱私政策</h2>

          <h3>資料收集與使用</h3>
          <p>
            「方音圖鑑」（dialects.yzup.top）致力於保護用戶隱私。我們鄭重承諾：
          </p>
          <ul>
            <li><strong>最小化資料收集</strong>：本網站僅收集必要的技術資訊（如訪問日誌、瀏覽器類型）以維護網站正常運行和改善用戶體驗。</li>
            <li><strong>無個人身份資訊</strong>：我們不主動收集可識別個人身份的資訊（如姓名、電子郵件地址、電話號碼等）。</li>
            <li><strong>數據安全</strong>：所有收集的資料均採用業界標準的安全措施進行保護，防止未經授權的訪問、披露、修改或破壞。</li>
          </ul>

          <h3>Cookies 使用</h3>
          <p>
            本網站可能使用 Cookies 和類似技術來：
          </p>
          <ul>
            <li>記住您的登錄狀態</li>
            <li>分析網站流量和用戶行為模式，以改進服務質量</li>
            <li>提供個性化的用戶體驗</li>
          </ul>
          <p class="note">
            您可以通過瀏覽器設置管理或禁用 Cookies，但這可能影響部分網站功能的正常使用。
          </p>


          <h3>資料保護承諾</h3>
          <p>
            我們承諾：
          </p>
          <ul>
            <li>✓ <strong>不出售或出租用戶資料</strong>給任何第三方</li>
            <li>✓ <strong>不洩露個人隱私資訊</strong>，除非法律要求或經用戶明確同意</li>
            <li>✓ <strong>定期審查安全措施</strong>，確保資料保護機制持續有效</li>
            <li>✓ <strong>透明溝通</strong>，如隱私政策有重大變更，將及時通知用戶</li>
          </ul>

          <h3>用戶權利</h3>
          <p>
            您有權：
          </p>
          <ul>
            <li>了解我們收集了哪些與您相關的資料</li>
            <li>要求更正或刪除不準確的資料</li>
            <li>選擇退出某些資料收集活動</li>
          </ul>

          <h3>聯繫方式</h3>
          <p>
            如對本隱私政策有任何疑問或意見，請通過以下方式聯繫我們：
          </p>
          <ul>
            <li>網站：<a href="https://dialects.yzup.top" target="_blank">https://dialects.yzup.top</a></li>
            <li>github：<a href="https://github.com/jengzang" target="_blank">https://github.com/jengzang</a></li>
            <li>知乎：<a href="https://www.zhihu.com/people/da-shu-18-11" target="_blank">https://www.zhihu.com/people/da-shu-18-11</a></li>
          </ul>

          <p class="update-note">
            <strong>最後更新時間</strong>：2026年1月
          </p>
        </section>

        <!-- 免责声明 -->
        <section class="section">
          <h2>⚠️ 免責聲明</h2>
          <p>
            本網站提供的方言資料僅供學術研究和文化交流使用。雖然我們力求資料的準確性和完整性，但不對資料的絕對準確性做出保證。使用本網站資料產生的任何後果，由使用者自行承擔。
          </p>
        </section>
      </div>

      <!-- English Version -->
      <div v-if="currentLang === 'en'" class="content-section">
        <!-- Citation -->
        <section class="section">
          <h2>📖 Citation</h2>
          <div class="citation-box">
            <p class="citation-text">
              Yang, Zheng. 2026. <em>Dialects Atlas</em>. Retrieved from <a href="https://dialects.yzup.top" target="_blank">https://dialects.yzup.top</a>
            </p>
            <button class="copy-btn" @click="() => {
              navigator.clipboard.writeText('Yang, Zheng. 2026. Dialects Atlas. Retrieved from https://dialects.yzup.top')
              alert('Copied to clipboard!')
            }">
              📋 Copy Citation
            </button>
          </div>
          <p class="note">
            If you use data from this website in academic papers, research reports, or other publications, please cite it according to the format above.
          </p>
        </section>

        <!-- Privacy Policy -->
        <section class="section">
          <h2>🔒 Privacy Policy</h2>

          <h3>Data Collection and Use</h3>
          <p>
            Dialects Atlas (dialects.yzup.top) is committed to protecting user privacy. We solemnly promise:
          </p>
          <ul>
            <li><strong>Minimal Data Collection</strong>: This website only collects necessary technical information (such as access logs, browser type) to maintain normal website operation and improve user experience.</li>
            <li><strong>No Personal Identification Information</strong>: We do not actively collect personally identifiable information (such as name, email address, phone number, etc.).</li>
            <li><strong>Data Security</strong>: All collected data is protected using industry-standard security measures to prevent unauthorized access, disclosure, modification, or destruction.</li>
          </ul>

          <h3>Use of Cookies</h3>
          <p>
            This website may use Cookies and similar technologies to:
          </p>
          <ul>
            <li>Remember your login status</li>
            <li>Analyze website traffic and user behavior patterns to improve service quality</li>
            <li>Provide personalized user experience</li>
          </ul>
          <p class="note">
            You can manage or disable Cookies through browser settings, but this may affect the normal use of some website functions.
          </p>


          <h3>Data Protection Commitment</h3>
          <p>
            We promise:
          </p>
          <ul>
            <li>✓ <strong>Not to sell or rent user data</strong> to any third party</li>
            <li>✓ <strong>Not to disclose personal privacy information</strong>, unless required by law or with explicit user consent</li>
            <li>✓ <strong>Regular security review</strong> to ensure data protection mechanisms remain effective</li>
            <li>✓ <strong>Transparent communication</strong>: users will be promptly notified of any significant changes to the privacy policy</li>
          </ul>

          <h3>User Rights</h3>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Know what data we have collected about you</li>
            <li>Request correction or deletion of inaccurate data</li>
            <li>Opt out of certain data collection activities</li>
          </ul>

          <h3>Contact Information</h3>
          <p>
            If you have any questions or comments about this privacy policy, please contact us:
          </p>
          <ul>
            <li>Website: <a href="https://dialects.yzup.top" target="_blank">https://dialects.yzup.top</a></li>
            <li>GitHub: <a href="https://github.com/jengzang" target="_blank">https://github.com/jengzang</a></li>
            <li>Zhihu: <a href="https://www.zhihu.com/people/da-shu-18-11" target="_blank">https://www.zhihu.com/people/da-shu-18-11</a></li>
          </ul>

          <p class="update-note">
            <strong>Last Updated</strong>: January 2026
          </p>
        </section>

        <!-- Disclaimer -->
        <section class="section">
          <h2>⚠️ Disclaimer</h2>
          <p>
            The dialect data provided on this website is for academic research and cultural exchange purposes only. While we strive for accuracy and completeness of data, we do not guarantee absolute accuracy. Users are responsible for any consequences arising from the use of data from this website.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacy-container {
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(230, 240, 255, 0.6));
}

.privacy-content {
  max-width: 900px;
  width: 100%;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.glass-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(0, 122, 255, 0.2);
}

.title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  background: linear-gradient(135deg, #007aff, #5856d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lang-toggle {
  padding: 8px 20px;
  border-radius: 20px;
  border: 2px solid #007aff;
  background: white;
  color: #007aff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.lang-toggle:hover {
  background: #007aff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.content-section {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 122, 255, 0.15);
}

.section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-top: 24px;
  margin-bottom: 12px;
}

.section p {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

.section ul {
  margin: 16px 0;
  padding-left: 24px;
}

.section li {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 8px;
}

.citation-box {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.05), rgba(88, 86, 214, 0.05));
  border-left: 4px solid #007aff;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.citation-text {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0;
  flex: 1;
  font-style: italic;
}

.citation-text a {
  color: #007aff;
  text-decoration: none;
}

.citation-text a:hover {
  text-decoration: underline;
}

.copy-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #007aff, #0051d5);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

.note {
  font-size: 14px;
  color: #666;
  font-style: italic;
  padding: 12px;
  background: rgba(0, 122, 255, 0.03);
  border-radius: 8px;
  margin-top: 12px;
}

.update-note {
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 204, 0, 0.1);
  border-left: 4px solid #ffcc00;
  border-radius: 8px;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .privacy-container {
    padding: 20px 10px;
  }

  .privacy-content {
    padding: 24px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .title {
    font-size: 24px;
  }

  .citation-box {
    flex-direction: column;
    align-items: stretch;
  }

  .copy-btn {
    width: 100%;
  }

  .section h2 {
    font-size: 20px;
  }

  .section h3 {
    font-size: 16px;
  }
}
</style>

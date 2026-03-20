<template>
  <div class="page-root">
    <!-- <h2 class="tabs-title">⚙️ {{ $t('navigation.tabs.settings') }}</h2> -->

    <div class="settings-container">
      <!-- 语言设置区域 -->
      <div class="setting-section">
        <h3 class="section-title">🌐 {{ $t('navigation.settings.language.title') }}</h3>
        <p class="section-description">{{ $t('navigation.settings.language.description') }}</p>

        <div class="language-options">
          <div
            v-for="lang in languages"
            :key="lang.code"
            class="language-card"
            :class="{ active: currentLocale === lang.code }"
            @click="changeLanguage(lang.code)"
          >
            <div class="language-flag">{{ lang.flag }}</div>
            <div class="language-info">
              <div class="language-name">{{ lang.name }}</div>
              <div class="language-code">{{ lang.code }}</div>
            </div>
            <div class="language-check" v-if="currentLocale === lang.code">
              ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n/index.js'
import { SUPPORTED_LOCALES } from '@/i18n/localeDetector.js'
import { showSuccess } from '@/utils/message.js'

const { locale, t } = useI18n()

// 当前语言
const currentLocale = computed(() => locale.value)

// 语言列表
const languages = ref([
  SUPPORTED_LOCALES['zh-Hant'],
  SUPPORTED_LOCALES['zh-CN'],
  SUPPORTED_LOCALES['en']
])

/**
 * 切换语言
 */
function changeLanguage(newLocale) {
  if (newLocale === currentLocale.value) {
    return
  }

  setLocale(newLocale)
  showSuccess(t('messages.success.languageChanged'))
  setTimeout(() => window.location.reload(), 500)
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.setting-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.language-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-card:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #007aff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
}

.language-card.active {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(0, 122, 255, 0.05));
  border-color: #007aff;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.language-flag {
  font-size: 32px;
  margin-right: 16px;
}

.language-info {
  flex: 1;
}

.language-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.language-code {
  font-size: 12px;
  color: #999;
}

.language-check {
  font-size: 24px;
  color: #007aff;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .settings-container {
    padding: 12px;
  }

  .setting-section {
    padding: 16px;
  }

  .language-flag {
    font-size: 28px;
    margin-right: 12px;
  }

  .language-name {
    font-size: 14px;
  }

  .language-code {
    font-size: 11px;
  }
}
</style>

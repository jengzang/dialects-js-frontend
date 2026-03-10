<template>
  <div class="modify-profile-form">
    <h3>{{ $t('auth.modifyProfile.welcome', { username: user.username }) }}</h3>

    <!-- Tab Switcher -->
    <TabSwitcher
      :tabs="tabs"
      :modelValue="modeType"
      @update:modelValue="$emit('update:modeType', $event)"
    />

    <!-- Modify Username Section -->
    <div v-if="modeType === 'username'">
      <FormInput
        v-model="localNewUsername"
        type="text"
        :placeholder="$t('auth.modifyProfile.username.placeholder')"
        icon="👤"
        :error="error"
      />
      <div class="form-row">
        <button class="btn-search" @click="handleSaveUsername" :disabled="loading">
          {{ $t('auth.modifyProfile.username.button') }}
        </button>
      </div>
    </div>

    <!-- Modify Password Section -->
    <div v-if="modeType === 'password'">
      <!-- Current Password -->
      <FormInput
        v-model="localCurrentPassword"
        type="password"
        :placeholder="$t('auth.modifyProfile.password.currentPlaceholder')"
        :showPasswordToggle="true"
        :error="error"
      />

      <!-- New Password -->
      <FormInput
        v-model="localNewPassword"
        type="password"
        :placeholder="$t('auth.modifyProfile.password.newPlaceholder')"
        :showPasswordToggle="true"
        :error="error"
      />

      <div class="form-row">
        <button class="btn-search" @click="handleSavePassword" :disabled="loading">
          {{ $t('auth.modifyProfile.password.button') }}
        </button>
      </div>
    </div>

    <!-- Error/Success Messages -->
    <p v-if="error" class="err" v-html="error"></p>
    <p v-if="success" class="success" v-html="success"></p>

    <!-- Back Button -->
    <div class="form-row" style="margin-top: 10px;">
      <button class="btn-search btn-back" @click="$emit('back')">
        {{ $t('auth.modifyProfile.backButton') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FormInput from './FormInput.vue'
import TabSwitcher from './TabSwitcher.vue'

const { t } = useI18n()

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  success: {
    type: String,
    default: ''
  },
  modeType: {
    type: String,
    default: 'username'
  }
})

const emit = defineEmits(['saveUsername', 'savePassword', 'back', 'update:modeType'])

const tabs = computed(() => [
  { label: t('auth.modifyProfile.tabs.username'), value: 'username' },
  { label: t('auth.modifyProfile.tabs.password'), value: 'password' }
])

const localNewUsername = ref('')
const localCurrentPassword = ref('')
const localNewPassword = ref('')

const handleSaveUsername = () => {
  emit('saveUsername', { newUsername: localNewUsername.value })
}

const handleSavePassword = () => {
  emit('savePassword', {
    currentPassword: localCurrentPassword.value,
    newPassword: localNewPassword.value
  })
}
</script>

<style scoped>
.modify-profile-form {
  padding: 12px;
  text-align: center;
}

h3 {
  font-size: 30px;
  font-weight: 700;
  color: #1c1c1e;
  margin-bottom: 16px;
}

.form-row {
  width: 100%;
  margin: 12px 0;
  display: flex;
  justify-content: center;
}

.btn-search {
  background-color: #007aff;
  color: white;
  padding: 12px 24px;
  font-size: 17px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-search:hover:not(:disabled) {
  background-color: #0056b3;
  transform: scale(1.04);
}

.btn-search:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-back {
  background: darkgoldenrod;
}

.btn-back:hover:not(:disabled) {
  background: #b8860b;
}

.err {
  color: red;
  margin-top: 10px;
  font-size: 15px;
  font-weight: bold;
}

.success {
  color: #34c759;
  margin-top: 10px;
  font-size: 15px;
  font-weight: bold;
}

/* Mobile responsive */
@media (max-aspect-ratio: 1/1) {
  .btn-search {
    width: 100%;
    padding: 16px;
    font-size: 18px;
  }

  .err {
    font-size: 16px;
  }
}
</style>

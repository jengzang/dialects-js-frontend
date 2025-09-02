<template>
  <div class="location-input" ref="container">
    <label for="locations" style="margin-bottom: 10px;">地點</label>
    <textarea
        id="locations"
        ref="inputEl"
        v-model="inputValue"
        placeholder="請輸入地點(可匹配)"
        @keyup="onKeyup"
        @blur="onBlur"
    ></textarea>

    <div ref="suggestionEl" class="inline-suggestion" v-show="suggestions.length || successMessage" :style="suggestionStyle">
      <div v-if="successMessage" class="success">✅ {{ successMessage }}</div>
      <div
          v-for="(item, index) in suggestions"
          :key="index"
          class="suggest-line"
          @mousedown.prevent="applySuggestion(item)"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const inputValue = ref('')
const inputEl = ref(null)
const suggestionEl = ref(null)
const container = ref(null)

const suggestions = ref([])
const successMessage = ref('')
const suggestionStyle = ref({ left: '0px', top: '0px' })

let debounceTimer = null

const onKeyup = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchSuggestion, 300)
}

const onBlur = () => {
  setTimeout(() => {
    suggestions.value = []
    successMessage.value = ''
  }, 200)
}

function getQueryStart() {
  const el = inputEl.value
  const cursorPos = el.selectionStart
  const value = el.value
  const separators = /[ ,;/，；、\n\t]/g

  let lastSepIndex = -1
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (separators.test(value[i])) {
      lastSepIndex = i
      break
    }
  }

  return {
    queryStart: lastSepIndex + 1,
    cursorPos,
    value
  }
}

function fetchSuggestion() {
  const { queryStart, cursorPos, value } = getQueryStart()
  const query = value.slice(queryStart, cursorPos).trim()

  if (!query) {
    suggestions.value = []
    successMessage.value = ''
    return
  }

  const token = localStorage.getItem('ACCESS_TOKEN')

  fetch(`${window.API_BASE}/batch_match?input_string=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
      .then(res => res.json())
      .then(results => {
        suggestions.value = []
        successMessage.value = ''
        if (!results.length) return

        const r = results[0]
        if (r.success) {
          successMessage.value = r.message
        } else {
          const allValues = value.split(/[ ,;/，；、\n\t]+/).filter(Boolean)
          const exclusionSet = new Set(allValues.filter(v => v !== query))
          const filtered = Array.from(new Set(r.items)).filter(item => !exclusionSet.has(item))
          if (!filtered.length) return
          suggestions.value = filtered
        }

        nextTick(() => {
          const rect = inputEl.value.getBoundingClientRect()
          suggestionStyle.value = {
            left: `${rect.left + window.scrollX}px`,
            top: `${rect.bottom + 6 + window.scrollY}px`,
            position: 'absolute',
            zIndex: 9999
          }
        })
      })
}

function applySuggestion(item) {
  const { queryStart, cursorPos, value } = getQueryStart()
  const before = value.slice(0, queryStart)
  const after = value.slice(cursorPos)
  const newVal = before + item + ' ' + after
  inputValue.value = newVal

  nextTick(() => {
    const pos = before.length + item.length + 1
    inputEl.value.setSelectionRange(pos, pos)
    suggestions.value = []
    successMessage.value = ''
  })
}
</script>

<style scoped>
textarea {
  width: 100%;
  height: 60px;
  box-sizing: border-box;
  font-family: monospace;
  font-size: 13px;
  margin-top: 4px;
  padding: 6px 10px;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  min-width: 60px;
}

textarea:hover {
  border-color: #007aff;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.6);
}

.inline-suggestion {
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  min-width: 100px;
  font-size: 13px;
  padding: 4px;
}

.suggest-line {
  padding: 4px 8px;
  cursor: pointer;
}

.suggest-line:hover {
  background-color: #f0f0f0;
}

.success {
  color: green;
  padding: 4px 8px;
  font-weight: bold;
}
</style>

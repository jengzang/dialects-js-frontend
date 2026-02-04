<template>
  <div class="phonology-matrix">
    <div v-if="location" class="location-title">{{ location }}</div>

    <div class="matrix-wrapper">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="corner-cell">聲母\韻母</th>
            <th v-for="initial in initials" :key="initial" class="initial-header">
              {{ initial || '零聲母' }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="final in finals" :key="final">
            <th class="final-header">{{ final || '零韻母' }}</th>
            <td
              v-for="initial in initials"
              :key="`${initial}-${final}`"
              class="matrix-cell"
            >
              <div v-if="getCellData(initial, final)" class="cell-content">
                <div
                  v-for="tone in tones"
                  :key="tone"
                  class="tone-row"
                >
                  <span v-if="getCellData(initial, final)[tone]?.length" class="tone-label">
                    {{ tone }}:
                  </span>
                  <span class="characters">
                    {{ getCellData(initial, final)[tone]?.join(' ') || '' }}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  location: {
    type: String,
    default: ''
  },
  initials: {
    type: Array,
    required: true
  },
  finals: {
    type: Array,
    required: true
  },
  tones: {
    type: Array,
    required: true
  },
  matrix: {
    type: Object,
    required: true
  }
})

const getCellData = (initial, final) => {
  return props.matrix[initial]?.[final] || null
}
</script>

<style scoped>
.phonology-matrix {
  width: 100%;
}

.location-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark-light);
  margin-bottom: 6px;
  text-align: center;
}

.matrix-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  border: 1px solid var(--border-gray-light);
  border-radius: var(--radius-lg);
  background: var(--glass-medium2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-md2);
}

/* 自定义滚动条样式 */
.matrix-wrapper::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.matrix-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.matrix-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  transition: background 0.2s;
}

.matrix-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.matrix-wrapper::-webkit-scrollbar-corner {
  background: transparent;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.corner-cell {
  background: var(--glass-lighter2);
  border: 1px solid var(--border-gray-lighter);
  padding: 10px;
  font-weight: 700;
  color: var(--text-dark);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 3;
  min-width: 60px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.initial-header {
  background: linear-gradient(145deg, rgba(0, 122, 255, 0.08), rgba(0, 122, 255, 0.04));
  border: 1px solid var(--border-gray-lighter);
  padding: 10px;
  font-weight: 600;
  color: var(--text-dark);
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 2;
  min-width: 120px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.final-header {
  background: linear-gradient(145deg, rgba(255, 152, 0, 0.08), rgba(255, 152, 0, 0.04));
  border: 1px solid var(--border-gray-lighter);
  padding: 10px;
  font-weight: 600;
  color: var(--text-dark);
  text-align: center;
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 80px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 14px;
}

.matrix-cell {
  border: 1px solid var(--border-gray-lightest);
  padding: 8px;
  vertical-align: top;
  min-width: 120px;
  max-width: 200px;
  background: var(--glass-very-light2);
  transition: background 0.2s ease;
}

.matrix-cell:hover {
  background: var(--glass-light2);
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tone-row {
  display: flex;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.tone-label {
  color: var(--text-secondary);
  font-weight: 600;
  min-width: 35px;
}

.characters {
  color: var(--text-dark);
  word-break: break-all;
}

/* 移动端适配 */
@media (max-aspect-ratio: 1/1) {

  .location-title {
    font-size: 20px;
    margin-bottom: 5px;
  }

  .matrix-table {
    font-size: 12px;
  }

  .corner-cell,
  .initial-header,
  .final-header {
    padding: 6px;
    min-width: 40px;
  }

  .matrix-cell {
    padding: 4px;
    min-width: 100px;
  }

  .tone-row {
    font-size: 11px;
  }

  .tone-label {
    min-width: 28px;
  }
}
</style>

<template>
  <div class="map-popup active">
    <p>{{ item.location }}</p>
    <p v-if="item.pair">{{ item.pair }}</p>

    <ul>
      <li>
        <span class="map-popup__label">{{ featureLabel }}</span>
        <span class="val">{{ item.feature }}</span>
      </li>
      <li>
        <span class="map-popup__label">{{ resultLabel }}</span>
        <span class="val">{{ statusIcon }} {{ statusText }}</span>
      </li>
      <li v-if="showReadingComparison">
        <span class="map-popup__label">{{ readingComparisonLabel }}</span>
        <span class="map-popup__detail" v-html="detailHtml"></span>
      </li>
      <li v-if="showSimilarity">
        <span class="map-popup__label">{{ similarityLabel }}</span>
        <span class="map-popup__percentage">{{ item.overlap }}%</span>
      </li>
      <li v-if="showDetail">
        <div v-if="structuredDetailRows.length" class="map-popup__detail-groups">
          <div
            v-for="(row, index) in structuredDetailRows"
            :key="`${row.label}-${index}`"
            class="map-popup__detail-group"
          >
            <span class="map-popup__detail-group-label">{{ row.label }}</span>
            <div class="map-popup__detail-group-values">
              <span
                v-for="(entry, entryIndex) in row.entries"
                :key="`${entry}-${entryIndex}`"
                class="map-popup__detail-chip"
              >
                {{ entry }}
              </span>
            </div>
          </div>
        </div>
        <span v-else class="map-popup__detail" v-html="detailHtml"></span>
      </li>
      <li v-if="showToneComparison">
        <span class="map-popup__label">{{ toneComparisonLabel }}</span>
        <span class="map-popup__detail" v-html="detailHtml"></span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  compareType: {
    type: String,
    default: ''
  },
  statusIcon: {
    type: String,
    default: ''
  },
  statusText: {
    type: String,
    default: ''
  },
  featureLabel: {
    type: String,
    default: ''
  },
  resultLabel: {
    type: String,
    default: ''
  },
  similarityLabel: {
    type: String,
    default: ''
  },
  readingComparisonLabel: {
    type: String,
    default: ''
  },
  detailLabel: {
    type: String,
    default: ''
  },
  toneComparisonLabel: {
    type: String,
    default: ''
  }
})

const detailHtml = computed(() => props.item.value || '')
const detailLines = computed(() => {
  if (!props.item.value) {
    return []
  }

  return props.item.value
    .split(/<br\s*\/?>|\r?\n/i)
    .map(line => line.trim())
    .filter(Boolean)
})

const structuredDetailRows = computed(() => {
  if (props.compareType !== 'zhonggu') {
    return []
  }

  const rows = detailLines.value
    .map(line => {
      const match = line.match(/^([^:：]+)[:：]\s*(.+)$/)
      if (!match) {
        return null
      }

      const [, label, valueText] = match
      const entries = valueText
        .split(/[，,]\s*/)
        .map(entry => entry.trim())
        .filter(Boolean)

      if (!entries.length) {
        return {
          label: label.trim(),
          entries: [valueText.trim()]
        }
      }

      return {
        label: label.trim(),
        entries
      }
    })
    .filter(Boolean)

  return rows.length === detailLines.value.length ? rows : []
})

const hasValue = computed(() => Boolean(props.item.value))

const showReadingComparison = computed(() => props.compareType === 'chars' && hasValue.value)
const showSimilarity = computed(() => props.compareType === 'zhonggu' && props.item.overlap !== undefined)
const showDetail = computed(() => props.compareType === 'zhonggu' && hasValue.value)
const showToneComparison = computed(() => props.compareType === 'tones' && hasValue.value)
</script>

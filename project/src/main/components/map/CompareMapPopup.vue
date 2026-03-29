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
        <span class="map-popup__label">{{ detailLabel }}</span>
        <span class="map-popup__detail" v-html="detailHtml"></span>
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

const hasValue = computed(() => Boolean(props.item.value))

const showReadingComparison = computed(() => props.compareType === 'chars' && hasValue.value)
const showSimilarity = computed(() => props.compareType === 'zhonggu' && props.item.overlap !== undefined)
const showDetail = computed(() => props.compareType === 'zhonggu' && hasValue.value)
const showToneComparison = computed(() => props.compareType === 'tones' && hasValue.value)
</script>

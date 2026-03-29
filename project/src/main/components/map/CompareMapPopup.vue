<template>
  <div class="compare-map-popup-card active">
    <p>{{ location }}</p>
    <p v-if="secondaryLine">{{ secondaryLine }}</p>

    <ul class="compare-map-popup-card__list">
      <li v-if="showFeatureRow">
        <span class="compare-map-popup-card__label">{{ featureLabel }}</span>
        <span class="compare-map-popup-card__value">{{ feature }}</span>
      </li>

      <li>
        <span class="compare-map-popup-card__label">{{ resultLabel }}</span>
        <span class="compare-map-popup-card__value">{{ resultIcon }} {{ resultText }}</span>
      </li>

      <li v-if="hasSimilarity">
        <span class="compare-map-popup-card__label">{{ similarityLabel }}</span>
        <span class="map-feature-popup__percentage">{{ similarity }}%</span>
      </li>

      <li v-if="detailText">
        <span class="compare-map-popup-card__label">{{ detailLabel }}</span>
        <span class="compare-map-popup-card__detail-text">{{ detailText }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  location: {
    type: String,
    default: ''
  },
  pair: {
    type: String,
    default: ''
  },
  feature: {
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
  resultIcon: {
    type: String,
    default: ''
  },
  resultText: {
    type: String,
    default: ''
  },
  similarityLabel: {
    type: String,
    default: ''
  },
  similarity: {
    type: [Number, String],
    default: null
  },
  detailLabel: {
    type: String,
    default: ''
  },
  detailText: {
    type: String,
    default: ''
  }
})

const hasSimilarity = computed(() => props.similarity !== null && props.similarity !== undefined && props.similarity !== '')
const secondaryLine = computed(() => props.pair || props.feature)
const showFeatureRow = computed(() => Boolean(props.pair && props.feature && props.pair !== props.feature))
</script>

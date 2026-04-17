<template>
  <div class="dialect-clustering-page">
    <header class="page-header main-glass-panel">
      <div>
        <h1>{{ t('cluster.page.title') }}</h1>
        <p>{{ t('cluster.page.description') }}</p>
      </div>
      <button
        class="global-action-btn global-action-btn-secondary reset-btn"
        type="button"
        @click="showResetModal = true"
      >
        {{ t('cluster.actions.reset') }}
      </button>
    </header>

    <nav
      class="step-nav main-glass-panel-inner"
      aria-label="Cluster workflow steps"
    >
      <button
        v-for="step in stepOptions"
        :key="step.value"
        class="step-pill"
        :class="{ active: currentStep === step.value, clickable: isStepReachable(step.value) }"
        type="button"
        :disabled="!isStepReachable(step.value)"
        @click="goToStep(step.value)"
      >
        <span class="step-pill__index">{{ step.index }}</span>
        <span>{{ step.label }}</span>
      </button>
    </nav>

    <section class="workflow-grid">
      <div class="workflow-main">
        <section
          class="panel main-glass-panel"
          data-step="input"
        >
          <div class="panel-header">
            <div>
              <h2>{{ t('cluster.input.title') }}</h2>
              <p>{{ t('cluster.input.description') }}</p>
            </div>
            <button
              class="global-action-btn global-action-btn-secondary add-group-btn"
              type="button"
              @click="addGroup"
            >
              {{ t('cluster.actions.addGroup') }}
            </button>
          </div>

          <div
            v-if="formErrorMessage"
            class="panel-alert panel-alert--error"
          >
            {{ formErrorMessage }}
          </div>

          <div class="location-section main-glass-panel-inner">
            <div class="section-heading">
              <h3>{{ t('cluster.input.locationTitle') }}</h3>
              <p>{{ t('cluster.input.locationDescription') }}</p>
            </div>
            <LocationAndRegionInput
              v-model="locationModel"
              :limit-context="'default'"
              @update:run-disabled="locationInputDisabled = $event"
            />
            <div class="inline-toggle-row">
              <label class="inline-toggle">
                <input
                  v-model="workspaceState.requestDraft.include_special_locations"
                  type="checkbox"
                >
                <span>{{ t('cluster.input.includeSpecialLocations') }}</span>
              </label>
            </div>
          </div>

          <div class="groups-stack">
            <article
              v-for="(group, index) in workspaceState.requestDraft.groups"
              :key="group.id"
              class="group-panel main-glass-panel-inner"
            >
              <div class="group-panel__header">
                <h3>{{ t('cluster.input.groupTitle', { index: index + 1 }) }}</h3>
                <button
                  class="global-action-btn global-action-btn-secondary group-remove-btn"
                  type="button"
                  :disabled="workspaceState.requestDraft.groups.length === 1"
                  @click="removeGroup(index)"
                >
                  {{ t('cluster.actions.removeGroup') }}
                </button>
              </div>

              <div class="form-grid">
                <label class="field">
                  <span>{{ t('cluster.input.groupLabel') }}</span>
                  <input
                    v-model="group.label"
                    type="text"
                    :placeholder="t('cluster.input.groupLabelPlaceholder')"
                  >
                </label>

                <div class="field">
                  <span>{{ t('cluster.input.compareDimension') }}</span>
                  <ChoiceSelector
                    v-model="group.compare_dimension"
                    :options="compareDimensionOptions"
                    :aria-label="t('cluster.input.compareDimension')"
                  />
                </div>

                <div class="field">
                  <span>{{ t('cluster.input.sourceMode') }}</span>
                  <ChoiceSelector
                    v-model="group.source_mode"
                    :options="sourceModeOptions"
                    :aria-label="t('cluster.input.sourceMode')"
                  />
                </div>
              </div>

              <div
                v-if="group.source_mode === 'path_strings'"
                class="source-section source-section--path"
              >
                <p class="source-hint">
                  {{ t('cluster.input.pathStringsHint') }}
                </p>
                <KeyButtonGroup
                  :available-keys="availableKeys"
                  :exclusive-rules="exclusiveRules"
                  :single-select-keys="singleSelectKeys"
                  :model-value="group.pathKeys"
                  @update:model-value="(value) => updateGroupPathKeys(group, value)"
                />
                <DropdownValueSelector
                  :selected-keys="group.pathKeys"
                  :model-value="group.pathValueMap"
                  :key-value-map="keyValueMap"
                  @update:model-value="(value) => updateGroupPathValueMap(group, value)"
                />
                <div class="preview-box">
                  <strong>{{ t('cluster.input.pathStringsPreview', { count: getGroupPathStrings(group).length }) }}</strong>
                  <div
                    v-if="getGroupPathStrings(group).length"
                    class="preview-chip-list"
                  >
                    <span
                      v-for="pathString in getGroupPathStrings(group)"
                      :key="pathString"
                      class="preview-chip"
                    >
                      {{ pathString }}
                    </span>
                  </div>
                  <p
                    v-else
                    class="preview-empty"
                  >
                    {{ t('cluster.input.emptyPathStrings') }}
                  </p>
                </div>
              </div>

              <div
                v-else
                class="source-section source-section--chars"
              >
                <label class="field">
                  <span>{{ t('cluster.input.resolvedCharsLabel') }}</span>
                  <textarea
                    v-model="group.resolvedCharsText"
                    rows="4"
                    :placeholder="t('cluster.input.resolvedCharsPlaceholder')"
                  />
                </label>
                <div class="preview-box">
                  <strong>{{ t('cluster.input.resolvedCharsPreview', { count: getResolvedChars(group).length }) }}</strong>
                  <div
                    v-if="getResolvedChars(group).length"
                    class="preview-chip-list"
                  >
                    <span
                      v-for="char in getResolvedChars(group)"
                      :key="`${group.id}-${char}`"
                      class="preview-chip"
                    >
                      {{ char }}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div class="panel-actions">
            <button
              class="global-action-btn global-action-btn-primary"
              type="button"
              :disabled="isPreviewPending"
              @click="handlePreview"
            >
              {{ workspaceState.previewData ? t('cluster.actions.refreshPreview') : t('cluster.actions.createPreview') }}
            </button>
          </div>
        </section>

        <section
          class="panel main-glass-panel"
          data-step="preview"
        >
          <div class="panel-header">
            <div>
              <h2>{{ t('cluster.preview.title') }}</h2>
              <p>{{ t('cluster.preview.description') }}</p>
            </div>
          </div>

          <div
            v-if="workspaceState.previewData"
            class="summary-card-grid"
          >
            <div class="summary-card main-glass-panel-inner">
              <span class="summary-card__label">{{ t('cluster.preview.metrics.groupCount') }}</span>
              <strong>{{ workspaceState.previewData.group_count ?? 0 }}</strong>
            </div>
            <div class="summary-card main-glass-panel-inner">
              <span class="summary-card__label">{{ t('cluster.preview.metrics.uniqueCharCount') }}</span>
              <strong>{{ workspaceState.previewData.unique_char_count ?? 0 }}</strong>
            </div>
            <div class="summary-card main-glass-panel-inner">
              <span class="summary-card__label">{{ t('cluster.preview.metrics.requestedLocationCount') }}</span>
              <strong>{{ workspaceState.previewData.requested_location_count ?? 0 }}</strong>
            </div>
            <div class="summary-card main-glass-panel-inner">
              <span class="summary-card__label">{{ t('cluster.preview.metrics.matchedLocationCount') }}</span>
              <strong>{{ workspaceState.previewData.matched_location_count ?? 0 }}</strong>
            </div>
            <div class="summary-card main-glass-panel-inner">
              <span class="summary-card__label">{{ t('cluster.preview.metrics.pairCount') }}</span>
              <strong>{{ workspaceState.previewData.estimated_pair_count ?? 0 }}</strong>
            </div>
            <div class="summary-card main-glass-panel-inner">
              <span class="summary-card__label">{{ t('cluster.preview.metrics.matrixMb') }}</span>
              <strong>{{ formatNumeric(workspaceState.previewData.estimated_dense_matrix_mb) }}</strong>
            </div>
          </div>

          <div
            v-if="workspaceState.prepareHash"
            class="hash-line"
          >
            <span>{{ t('cluster.preview.hashLabel') }}</span>
            <code>{{ workspaceState.prepareHash }}</code>
          </div>

          <p class="preview-hint">
            {{ t('cluster.preview.continueHint') }}
          </p>

          <div class="panel-actions">
            <button
              class="global-action-btn global-action-btn-primary"
              type="button"
              :disabled="!workspaceState.prepareHash || isPreparePending"
              @click="handlePrepare"
            >
              {{ t('cluster.actions.continuePrepare') }}
            </button>
          </div>
        </section>

        <section
          class="panel main-glass-panel"
          data-step="prepare"
        >
          <div class="panel-header">
            <div>
              <h2>{{ t('cluster.prepare.title') }}</h2>
              <p>{{ t('cluster.prepare.description') }}</p>
            </div>
            <span
              class="status-badge"
              :class="statusBadgeClass(prepareStepStatus)"
            >
              {{ t(`cluster.status.${prepareStepStatus}`) }}
            </span>
          </div>
          <p class="section-note">
            {{ workspaceState.prepareCompleted ? t('cluster.prepare.ready') : t('cluster.prepare.waiting') }}
          </p>
        </section>

        <section
          class="panel main-glass-panel"
          data-step="distance"
        >
          <div class="panel-header">
            <div>
              <h2>{{ t('cluster.distance.title') }}</h2>
              <p>{{ t('cluster.distance.description') }}</p>
            </div>
          </div>

          <div class="mode-panel main-glass-panel-inner">
            <RadioGroup
              v-model="workspaceState.selectedPhonemeMode"
              name="phoneme-mode"
              :options="phonemeModeOptions"
            />
          </div>

          <div
            v-if="currentDistanceHash"
            class="hash-line"
          >
            <span>{{ t('cluster.distance.hashLabel') }}</span>
            <code>{{ currentDistanceHash }}</code>
          </div>

          <p class="section-note">
            {{ workspaceState.prepareCompleted ? t('cluster.distance.ready') : t('cluster.distance.waiting') }}
          </p>

          <div class="panel-actions">
            <button
              class="global-action-btn global-action-btn-primary"
              type="button"
              :disabled="!workspaceState.prepareCompleted || isDistancePending"
              @click="handleDistance"
            >
              {{ t('cluster.actions.runDistance') }}
            </button>
          </div>
        </section>

        <section
          class="panel main-glass-panel"
          data-step="cluster"
        >
          <div class="panel-header">
            <div>
              <h2>{{ t('cluster.clustering.title') }}</h2>
              <p>{{ t('cluster.clustering.description') }}</p>
            </div>
          </div>

          <div class="cluster-form main-glass-panel-inner">
            <div class="form-grid">
              <div class="field">
                <span>{{ t('cluster.clustering.algorithm') }}</span>
                <SimpleSelectDropdown
                  v-model="workspaceState.clustering.algorithm"
                  :options="algorithmOptions"
                  :match-trigger-width="true"
                  width="100%"
                />
              </div>

              <label
                v-if="showNClustersField"
                class="field"
              >
                <span>{{ t('cluster.clustering.nClusters') }}</span>
                <input
                  v-model.number="workspaceState.clustering.n_clusters"
                  type="number"
                  min="2"
                  step="1"
                >
              </label>

              <div
                v-if="workspaceState.clustering.algorithm === 'agglomerative'"
                class="field"
              >
                <span>{{ t('cluster.clustering.linkage') }}</span>
                <SimpleSelectDropdown
                  v-model="workspaceState.clustering.linkage"
                  :options="linkageOptions"
                  :match-trigger-width="true"
                  width="100%"
                />
              </div>

              <label
                v-if="workspaceState.clustering.algorithm === 'dbscan'"
                class="field"
              >
                <span>{{ t('cluster.clustering.eps') }}</span>
                <input
                  v-model.number="workspaceState.clustering.eps"
                  type="number"
                  min="0"
                  step="0.1"
                >
              </label>

              <label
                v-if="workspaceState.clustering.algorithm === 'dbscan'"
                class="field"
              >
                <span>{{ t('cluster.clustering.minSamples') }}</span>
                <input
                  v-model.number="workspaceState.clustering.min_samples"
                  type="number"
                  min="1"
                  step="1"
                >
              </label>

              <label
                v-if="showRandomStateField"
                class="field"
              >
                <span>{{ t('cluster.clustering.randomState') }}</span>
                <input
                  v-model.number="workspaceState.clustering.random_state"
                  type="number"
                  step="1"
                >
              </label>
            </div>
          </div>

          <div
            v-if="currentResultHash"
            class="hash-line"
          >
            <span>{{ t('cluster.clustering.resultHash') }}</span>
            <code>{{ currentResultHash }}</code>
          </div>

          <p class="section-note">
            {{ currentDistanceHash ? t('cluster.clustering.description') : t('cluster.clustering.waiting') }}
          </p>

          <div class="panel-actions">
            <button
              class="global-action-btn global-action-btn-primary"
              type="button"
              :disabled="!currentDistanceHash || isClusterPending"
              @click="handleCluster"
            >
              {{ t('cluster.actions.runCluster') }}
            </button>
          </div>
        </section>

        <section
          class="panel main-glass-panel quick-run-panel"
          data-step="quick-run"
        >
          <details :open="quickRunOpen">
            <summary
              class="quick-run-summary"
              @click.prevent="quickRunOpen = !quickRunOpen"
            >
              <span>{{ t('cluster.quickRun.collapsed') }}</span>
              <span class="quick-run-summary__label">{{ QUICK_RUN_FALLBACK_LABEL }}</span>
            </summary>
            <div class="quick-run-body">
              <h2>{{ t('cluster.quickRun.title') }}</h2>
              <p>{{ t('cluster.quickRun.description') }}</p>
              <button
                class="global-action-btn global-action-btn-secondary"
                type="button"
                :disabled="isQuickRunPending"
                @click="handleQuickRun"
              >
                {{ t('cluster.actions.runQuick') }}
              </button>
            </div>
          </details>
        </section>

        <section
          class="panel main-glass-panel"
          data-step="result"
        >
          <div class="panel-header">
            <div>
              <h2>{{ t('cluster.result.title') }}</h2>
              <p>{{ t('cluster.result.description') }}</p>
            </div>
            <button
              v-if="canReloadResult"
              class="global-action-btn global-action-btn-secondary reload-result-btn"
              type="button"
              @click="reloadCurrentResult"
            >
              {{ t('cluster.actions.reloadResult') }}
            </button>
          </div>

          <div
            v-if="clusterResult"
            class="result-stack"
          >
            <div class="summary-card-grid">
              <div
                v-for="card in resultSummaryCards"
                :key="card.label"
                class="summary-card main-glass-panel-inner"
              >
                <span class="summary-card__label">{{ card.label }}</span>
                <strong>{{ card.value }}</strong>
              </div>
            </div>

            <div class="result-section main-glass-panel-inner">
              <h3>{{ t('cluster.result.assignments') }}</h3>
              <div class="table-scroll ui-scrollbar">
                <table class="result-table">
                  <thead>
                    <tr>
                      <th>{{ t('cluster.result.columns.location') }}</th>
                      <th>{{ t('cluster.result.columns.clusterId') }}</th>
                      <th>{{ t('cluster.result.columns.province') }}</th>
                      <th>{{ t('cluster.result.columns.city') }}</th>
                      <th>{{ t('cluster.result.columns.county') }}</th>
                      <th>{{ t('cluster.result.columns.town') }}</th>
                      <th>{{ t('cluster.result.columns.yindianRegion') }}</th>
                      <th>{{ t('cluster.result.columns.mapRegion') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="assignment in assignments"
                      :key="assignment.location + '-' + assignment.cluster_id"
                    >
                      <td>{{ assignment.location || '—' }}</td>
                      <td>{{ assignment.cluster_id ?? '—' }}</td>
                      <td>{{ assignment.province || '—' }}</td>
                      <td>{{ assignment.city || '—' }}</td>
                      <td>{{ assignment.county || '—' }}</td>
                      <td>{{ assignment.town || '—' }}</td>
                      <td>{{ assignment.yindian_region || '—' }}</td>
                      <td>{{ assignment.map_region || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="result-section main-glass-panel-inner">
              <h3>{{ t('cluster.result.groups') }}</h3>
              <div class="diagnostic-list">
                <article
                  v-for="group in resultGroups"
                  :key="group.label || group.group_id || JSON.stringify(group)"
                  class="diagnostic-card"
                >
                  <h4>{{ group.label || 'Group' }}</h4>
                  <pre>{{ formatStructuredValue(group) }}</pre>
                </article>
              </div>
            </div>

            <details class="result-section main-glass-panel-inner">
              <summary>{{ t('cluster.result.advanced') }}</summary>
              <div class="advanced-stack">
                <div>
                  <h3>{{ t('cluster.result.performance') }}</h3>
                  <div class="performance-list">
                    <div
                      v-for="[key, value] in performanceEntries"
                      :key="key"
                      class="performance-row"
                    >
                      <span>{{ key }}</span>
                      <strong>{{ formatNumeric(value) }}</strong>
                    </div>
                  </div>
                </div>
                <div v-if="cacheEntries.length > 0">
                  <h3>{{ t('cluster.result.cacheInfo') }}</h3>
                  <div class="performance-list">
                    <div
                      v-for="[key, value] in cacheEntries"
                      :key="key"
                      class="performance-row"
                    >
                      <span>{{ key }}</span>
                      <strong>{{ String(value) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <p
            v-else
            class="section-note"
          >
            {{ t('cluster.result.empty') }}
          </p>
        </section>
      </div>

      <aside class="workflow-side">
        <section class="panel main-glass-panel">
          <div class="panel-header">
            <div>
              <h2>{{ t('cluster.task.title') }}</h2>
              <p>{{ t('cluster.task.message') }}</p>
            </div>
          </div>

          <div
            v-if="workspaceState.activeTask.taskId"
            class="task-status-card main-glass-panel-inner"
          >
            <div class="task-row">
              <span>{{ t('cluster.task.source') }}</span>
              <strong>{{ t(`cluster.task.${workspaceState.activeTask.source}`) }}</strong>
            </div>
            <div class="task-row">
              <span>{{ t('cluster.task.taskId') }}</span>
              <code>{{ workspaceState.activeTask.taskId }}</code>
            </div>
            <div class="task-row">
              <span>{{ t('cluster.task.status') }}</span>
              <strong>{{ t(`cluster.status.${mapTaskStatus(workspaceState.activeTask.status)}`) }}</strong>
            </div>
            <div class="progress-shell">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: `${workspaceState.activeTask.progress || 0}%` }"
                />
              </div>
              <span>{{ workspaceState.activeTask.progress || 0 }}%</span>
            </div>
            <p class="task-message">
              {{ workspaceState.activeTask.message || '—' }}
            </p>
          </div>
          <p
            v-else
            class="section-note"
          >
            {{ t('cluster.status.idle') }}
          </p>
        </section>
      </aside>
    </section>

    <AppModal
      v-model="showResetModal"
      size="sm"
      :title="t('cluster.actions.reset')"
      :close-label="t('common.button.close')"
    >
      <p>{{ t('cluster.page.description') }}</p>
      <template #footer>
        <button
          class="global-action-btn global-action-btn-secondary"
          type="button"
          @click="showResetModal = false"
        >
          {{ t('common.button.cancel') }}
        </button>
        <button
          class="global-action-btn global-action-btn-primary"
          type="button"
          @click="confirmResetWorkspace"
        >
          {{ t('common.button.confirm') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppModal from '@/components/common/AppModal.vue'
import ChoiceSelector from '@/components/selector/ChoiceSelector.vue'
import RadioGroup from '@/components/selector/RadioGroup.vue'
import SimpleSelectDropdown from '@/components/selector/SimpleSelectDropdown.vue'
import { useClusterApi } from '@/api'
import KeyButtonGroup from '@/main/components/query/KeyButtonGroup.vue'
import DropdownValueSelector from '@/main/components/query/DropdownValueSelector.vue'
import LocationAndRegionInput from '@/main/components/geo/LocationAndRegionInput.vue'
import { useStorageState } from '@/composables/core/useStorageState.js'
import { usePollingTask } from '@/composables/core/usePollingTask.js'
import { useQueryConfig } from '@/composables/domain/useQueryConfig.js'
import { useRouteQueryState } from '@/composables/router/useRouteQueryState.js'
import { showError, showSuccess, showWarning } from '@/utils/message.js'

const QUICK_RUN_FALLBACK_LABEL = 'Quick Run'
const STEP_ORDER = ['input', 'preview', 'prepare', 'distance', 'cluster', 'result']
const STORAGE_KEY = 'cluster-workspace-v1'
const DEFAULT_GROUP_KEYS = ['攝']

const { t } = useI18n()
const {
  previewCluster,
  prepareCluster,
  buildClusterDistance,
  runClusterStage,
  runClusterJob,
  getClusterJobStatus,
  getClusterJobResult,
  getClusterStagedResult
} = useClusterApi()

const { keyValueMap, availableKeys, exclusiveRules, singleSelectKeys } = useQueryConfig('characters')

const compareDimensionOptions = computed(() => ([
  { value: 'initial', label: t('cluster.dimensions.initial') },
  { value: 'final', label: t('cluster.dimensions.final') },
  { value: 'tone', label: t('cluster.dimensions.tone') }
]))

const sourceModeOptions = computed(() => ([
  { value: 'path_strings', label: t('cluster.input.pathStrings') },
  { value: 'resolved_chars', label: t('cluster.input.resolvedChars') }
]))

const phonemeModeOptions = computed(() => ([
  { value: 'intra_group', label: t('cluster.phonemeModes.intra_group') },
  { value: 'anchored_inventory', label: t('cluster.phonemeModes.anchored_inventory') },
  { value: 'shared_request_identity', label: t('cluster.phonemeModes.shared_request_identity') }
]))

const algorithmOptions = computed(() => ([
  { value: 'agglomerative', label: t('cluster.algorithms.agglomerative') },
  { value: 'dbscan', label: t('cluster.algorithms.dbscan') },
  { value: 'kmeans', label: t('cluster.algorithms.kmeans') },
  { value: 'gmm', label: t('cluster.algorithms.gmm') }
]))

const linkageOptions = [
  { value: 'average', label: 'average' },
  { value: 'complete', label: 'complete' },
  { value: 'single', label: 'single' },
  { value: 'ward', label: 'ward' }
]

const stepOptions = computed(() => STEP_ORDER.map((step, index) => ({
  value: step,
  index: index + 1,
  label: t(`cluster.steps.${step}`)
})))

const { state: currentStepState, set: setCurrentStep } = useRouteQueryState('step', {
  defaultValue: 'input',
  parse: (value) => STEP_ORDER.includes(value) ? value : 'input',
  serialize: (value) => value,
  replace: true
})

const currentStep = computed(() => currentStepState.value)

const { state: persistedWorkspaceState, write: writePersistedWorkspaceState, remove: removePersistedWorkspaceState } = useStorageState(STORAGE_KEY, {
  defaultValue: createDefaultWorkspaceState(),
  storage: 'session'
})

const workspaceState = reactive(normalizeWorkspaceState(persistedWorkspaceState.value))
const locationModel = ref({
  locations: [...workspaceState.requestDraft.locations],
  regions: [...workspaceState.requestDraft.regions],
  regionUsing: workspaceState.requestDraft.region_mode
})

const formErrorMessage = ref('')
const clusterResult = ref(null)
const quickRunOpen = ref(false)
const showResetModal = ref(false)
const locationInputDisabled = ref(false)

const taskPolling = usePollingTask({
  intervalMs: 800,
  maxFailures: 5
})

watch(locationModel, (value) => {
  workspaceState.requestDraft.locations = normalizeStringArray(value?.locations)
  workspaceState.requestDraft.regions = normalizeStringArray(value?.regions)
  workspaceState.requestDraft.region_mode = value?.regionUsing || 'yindian'
}, { deep: true, immediate: true })

watch(workspaceState, () => {
  writePersistedWorkspaceState(serializeWorkspaceState())
}, { deep: true })

watch(currentStep, (step) => {
  workspaceState.currentStep = step
})

const prepareStepStatus = computed(() => {
  if (workspaceState.prepareCompleted) return 'completed'
  if (workspaceState.activeTask.stage === 'prepare') return mapTaskStatus(workspaceState.activeTask.status)
  return workspaceState.prepareHash ? 'pending' : 'idle'
})

const currentDistanceHash = computed(() => {
  return workspaceState.distanceHashByMode[workspaceState.selectedPhonemeMode] || ''
})

const currentResultKey = computed(() => buildResultKey(workspaceState.selectedPhonemeMode, buildClusteringPayload()))
const currentResultHash = computed(() => workspaceState.resultHashByKey[currentResultKey.value] || '')

const resultGroups = computed(() => {
  return Array.isArray(clusterResult.value?.groups) ? clusterResult.value.groups : []
})

const assignments = computed(() => {
  return Array.isArray(clusterResult.value?.assignments) ? clusterResult.value.assignments : []
})

const performanceEntries = computed(() => {
  return Object.entries(clusterResult.value?.metadata?.performance || {})
})

const cacheEntries = computed(() => {
  return Object.entries(clusterResult.value?.metadata || {}).filter(([key]) => key === 'cache_hit' || key === 'cache_source')
})

const resultSummaryCards = computed(() => {
  const summary = clusterResult.value?.summary || {}
  return [
    {
      label: t('cluster.result.summaryCards.algorithm'),
      value: summary.algorithm || workspaceState.clustering.algorithm || '—'
    },
    {
      label: t('cluster.result.summaryCards.phonemeMode'),
      value: summary.phoneme_mode || workspaceState.selectedPhonemeMode
    },
    {
      label: t('cluster.result.summaryCards.clusterCount'),
      value: summary.cluster_count ?? clusterResult.value?.metrics?.n_clusters ?? '—'
    },
    {
      label: t('cluster.result.summaryCards.effectiveLocationCount'),
      value: summary.effective_location_count ?? assignments.value.length ?? '—'
    }
  ]
})

const showNClustersField = computed(() => {
  return workspaceState.clustering.algorithm !== 'dbscan'
})

const showRandomStateField = computed(() => {
  return workspaceState.clustering.algorithm !== 'dbscan'
})

const isPreviewPending = computed(() => workspaceState.activeTask.stage === 'preview' && isTaskBusy(workspaceState.activeTask.status))
const isPreparePending = computed(() => workspaceState.activeTask.stage === 'prepare' && isTaskBusy(workspaceState.activeTask.status))
const isDistancePending = computed(() => workspaceState.activeTask.stage === 'distance' && isTaskBusy(workspaceState.activeTask.status))
const isClusterPending = computed(() => workspaceState.activeTask.stage === 'cluster' && isTaskBusy(workspaceState.activeTask.status))
const isQuickRunPending = computed(() => workspaceState.activeTask.stage === 'quick-run' && isTaskBusy(workspaceState.activeTask.status))

const canReloadResult = computed(() => {
  if (workspaceState.activeResultSource === 'staged') {
    return Boolean(currentResultHash.value)
  }

  return workspaceState.activeResultSource === 'jobs' && Boolean(workspaceState.activeTask.taskId)
})

recoverWorkspace()

function createDefaultClusteringState() {
  return {
    algorithm: 'agglomerative',
    n_clusters: 8,
    linkage: 'average',
    random_state: 42,
    eps: 0.5,
    min_samples: 5
  }
}

function createIdleActiveTask(source = 'staged') {
  return {
    stage: '',
    taskId: '',
    status: 'idle',
    progress: 0,
    message: '',
    source
  }
}

function createEmptyGroup() {
  return {
    id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: '',
    compare_dimension: 'final',
    source_mode: 'path_strings',
    pathKeys: [...DEFAULT_GROUP_KEYS],
    pathValueMap: {},
    resolvedCharsText: '',
    table_name: 'characters'
  }
}

function createDefaultWorkspaceState() {
  return {
    currentStep: 'input',
    requestDraft: {
      groups: [createEmptyGroup()],
      locations: [],
      regions: [],
      region_mode: 'yindian',
      include_special_locations: false
    },
    previewData: null,
    prepareHash: '',
    prepareTaskId: '',
    prepareCompleted: false,
    selectedPhonemeMode: 'intra_group',
    distanceHashByMode: {},
    distanceTaskIdByMode: {},
    resultHashByKey: {},
    resultTaskIdByKey: {},
    activeResultSource: 'staged',
    activeTask: createIdleActiveTask('staged'),
    clustering: createDefaultClusteringState()
  }
}

function normalizeWorkspaceState(value) {
  const defaults = createDefaultWorkspaceState()
  const requestDraft = value?.requestDraft || defaults.requestDraft
  const groups = Array.isArray(requestDraft.groups) && requestDraft.groups.length > 0
    ? requestDraft.groups.map((group) => ({
        ...createEmptyGroup(),
        ...group,
        pathKeys: Array.isArray(group.pathKeys) && group.pathKeys.length > 0 ? group.pathKeys : [...DEFAULT_GROUP_KEYS],
        pathValueMap: group.pathValueMap || {},
        resolvedCharsText: group.resolvedCharsText || ''
      }))
    : defaults.requestDraft.groups

  return {
    ...defaults,
    ...value,
    requestDraft: {
      ...defaults.requestDraft,
      ...requestDraft,
      groups,
      locations: normalizeStringArray(requestDraft.locations),
      regions: normalizeStringArray(requestDraft.regions),
      region_mode: requestDraft.region_mode || 'yindian',
      include_special_locations: Boolean(requestDraft.include_special_locations)
    },
    distanceHashByMode: { ...defaults.distanceHashByMode, ...(value?.distanceHashByMode || {}) },
    distanceTaskIdByMode: { ...defaults.distanceTaskIdByMode, ...(value?.distanceTaskIdByMode || {}) },
    resultHashByKey: { ...defaults.resultHashByKey, ...(value?.resultHashByKey || {}) },
    resultTaskIdByKey: { ...defaults.resultTaskIdByKey, ...(value?.resultTaskIdByKey || {}) },
    activeTask: {
      ...defaults.activeTask,
      ...(value?.activeTask || {})
    },
    clustering: {
      ...defaults.clustering,
      ...(value?.clustering || {})
    }
  }
}

function serializeWorkspaceState() {
  return {
    ...workspaceState,
    requestDraft: {
      ...workspaceState.requestDraft,
      groups: workspaceState.requestDraft.groups.map((group) => ({
        ...group
      }))
    },
    activeTask: {
      ...workspaceState.activeTask
    },
    clustering: {
      ...workspaceState.clustering
    }
  }
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => typeof value === 'string' ? value.trim() : '')
    .filter(Boolean)
}

function updateGroupPathKeys(group, value) {
  group.pathKeys = Array.isArray(value) && value.length > 0 ? value : [...DEFAULT_GROUP_KEYS]
  group.pathValueMap = Object.fromEntries(
    Object.entries(group.pathValueMap).filter(([key]) => group.pathKeys.includes(key))
  )
}

function updateGroupPathValueMap(group, value) {
  group.pathValueMap = value || {}
}

function getGroupPathStrings(group) {
  const validEntries = group.pathKeys
    .map((key) => ({ key, values: Array.isArray(group.pathValueMap[key]) ? group.pathValueMap[key].filter(Boolean) : [] }))
    .filter((entry) => entry.values.length > 0)

  if (validEntries.length === 0) {
    return []
  }

  return validEntries.reduce((paths, entry) => {
    const nextPaths = []

    paths.forEach((path) => {
      entry.values.forEach((value) => {
        nextPaths.push(`${path}[${value}]{${entry.key}}`)
      })
    })

    return nextPaths
  }, [''])
}

function getResolvedChars(group) {
  return Array.from(new Set(
    String(group.resolvedCharsText || '')
      .split(/[\s,，;；、]+/)
      .flatMap((token) => Array.from(token.trim()))
      .filter(Boolean)
  ))
}

function getEffectiveGroups() {
  return workspaceState.requestDraft.groups.map((group) => {
    const pathStrings = getGroupPathStrings(group)
    const resolvedChars = getResolvedChars(group)

    return {
      ...group,
      pathStrings,
      resolvedChars
    }
  })
}

function buildPreviewRequestDraft() {
  const groups = getEffectiveGroups()
    .filter((group) => group.label && group.compare_dimension)
    .map((group) => {
      if (group.source_mode === 'resolved_chars') {
        return {
          label: group.label,
          source_mode: 'resolved_chars',
          resolved_chars: group.resolvedChars,
          compare_dimension: group.compare_dimension
        }
      }

      return {
        label: group.label,
        source_mode: 'path_strings',
        table_name: 'characters',
        path_strings: group.pathStrings,
        compare_dimension: group.compare_dimension
      }
    })

  return {
    groups,
    locations: normalizeStringArray(workspaceState.requestDraft.locations),
    regions: normalizeStringArray(workspaceState.requestDraft.regions),
    region_mode: workspaceState.requestDraft.region_mode || 'yindian',
    include_special_locations: Boolean(workspaceState.requestDraft.include_special_locations)
  }
}

function buildClusteringPayload() {
  const { algorithm } = workspaceState.clustering

  if (algorithm === 'agglomerative') {
    return {
      algorithm,
      n_clusters: normalizePositiveInteger(workspaceState.clustering.n_clusters, 8),
      linkage: workspaceState.clustering.linkage || 'average',
      random_state: normalizeInteger(workspaceState.clustering.random_state, 42)
    }
  }

  if (algorithm === 'dbscan') {
    return {
      algorithm,
      eps: normalizePositiveNumber(workspaceState.clustering.eps, 0.5),
      min_samples: normalizePositiveInteger(workspaceState.clustering.min_samples, 5)
    }
  }

  if (algorithm === 'kmeans') {
    return {
      algorithm,
      n_clusters: normalizePositiveInteger(workspaceState.clustering.n_clusters, 8),
      random_state: normalizeInteger(workspaceState.clustering.random_state, 42)
    }
  }

  if (algorithm === 'gmm') {
    return {
      algorithm,
      n_clusters: normalizePositiveInteger(workspaceState.clustering.n_clusters, 8),
      random_state: normalizeInteger(workspaceState.clustering.random_state, 42)
    }
  }

  return {
    algorithm: 'agglomerative',
    n_clusters: 8,
    linkage: 'average',
    random_state: 42
  }
}

function buildResultKey(phonemeMode, clustering) {
  return JSON.stringify({
    phonemeMode,
    algorithm: clustering.algorithm,
    n_clusters: clustering.n_clusters ?? null,
    linkage: clustering.linkage ?? null,
    eps: clustering.eps ?? null,
    min_samples: clustering.min_samples ?? null,
    random_state: clustering.random_state ?? null
  })
}

function validateRequestDraft() {
  if (locationInputDisabled.value) {
    return t('cluster.errors.locationRequired')
  }

  if (workspaceState.requestDraft.groups.length === 0) {
    return t('cluster.errors.invalidInput')
  }

  for (const group of getEffectiveGroups()) {
    if (!group.label.trim()) {
      return t('cluster.errors.groupLabelRequired')
    }

    if (!group.compare_dimension) {
      return t('cluster.errors.groupDimensionRequired')
    }

    if (group.source_mode === 'resolved_chars' && group.resolvedChars.length === 0) {
      return t('cluster.errors.groupSourceRequired')
    }

    if (group.source_mode === 'path_strings' && group.pathStrings.length === 0) {
      return t('cluster.errors.groupSourceRequired')
    }
  }

  if (!workspaceState.requestDraft.locations.length && !workspaceState.requestDraft.regions.length) {
    return t('cluster.errors.locationRequired')
  }

  return ''
}

function mapTaskStatus(status) {
  if (status === 'queued') return 'pending'
  if (status === 'done') return 'completed'
  if (status === 'error') return 'failed'
  return status || 'idle'
}

function isTaskBusy(status) {
  return ['pending', 'processing', 'queued'].includes(status)
}

function isStepReachable(step) {
  if (step === 'input') return true
  if (step === 'preview') return Boolean(workspaceState.previewData)
  if (step === 'prepare') return Boolean(workspaceState.prepareHash)
  if (step === 'distance') return workspaceState.prepareCompleted
  if (step === 'cluster') return Boolean(currentDistanceHash.value)
  if (step === 'result') {
    if (clusterResult.value) {
      return true
    }

    if (workspaceState.activeResultSource === 'jobs') {
      return mapTaskStatus(workspaceState.activeTask.status) === 'completed'
    }

    return Boolean(currentResultHash.value) && mapTaskStatus(workspaceState.activeTask.status) === 'completed'
  }
  return false
}

async function goToStep(step) {
  if (!isStepReachable(step)) {
    return
  }

  await setCurrentStep(step)
}

function addGroup() {
  workspaceState.requestDraft.groups.push(createEmptyGroup())
}

function removeGroup(index) {
  if (workspaceState.requestDraft.groups.length === 1) {
    return
  }

  workspaceState.requestDraft.groups.splice(index, 1)
}

async function handlePreview() {
  formErrorMessage.value = validateRequestDraft()
  clusterResult.value = null

  if (formErrorMessage.value) {
    showWarning(formErrorMessage.value)
    return
  }

  const requestDraft = buildPreviewRequestDraft()
  workspaceState.requestDraft = {
    ...workspaceState.requestDraft,
    ...requestDraft
  }

  try {
    const previousPrepareHash = workspaceState.prepareHash
    const response = await previewCluster(requestDraft)
    const nextPrepareHash = response.prepare_hash || ''

    if (nextPrepareHash !== previousPrepareHash) {
      clearDerivedStageState()
    }

    workspaceState.previewData = response.preview || null
    workspaceState.prepareHash = nextPrepareHash
    workspaceState.prepareCompleted = Boolean(response.prepare_ready)
    formErrorMessage.value = ''
    workspaceState.activeResultSource = 'staged'
    workspaceState.activeTask = createIdleActiveTask('staged')

    if (workspaceState.prepareCompleted) {
      await setCurrentStep('distance')
    } else {
      await setCurrentStep('preview')
    }

    showSuccess(t('cluster.preview.title'))
  } catch (error) {
    handleActionError(error, 'prepare')
  }
}

async function handlePrepare() {
  if (!workspaceState.prepareHash) {
    return
  }

  formErrorMessage.value = ''

  try {
    const response = await prepareCluster(workspaceState.prepareHash)
    workspaceState.prepareTaskId = response.task_id || ''
    workspaceState.activeTask = {
      stage: 'prepare',
      taskId: response.task_id || '',
      status: mapTaskStatus(response.status),
      progress: response.progress || 0,
      message: response.message || '',
      source: 'staged'
    }
    await setCurrentStep('prepare')

    if (mapTaskStatus(response.status) === 'completed') {
      workspaceState.prepareCompleted = true
      await setCurrentStep('distance')
      return
    }

    await pollTaskUntilSettled('prepare', response.task_id, {
      source: 'staged',
      onCompleted: async () => {
        workspaceState.prepareCompleted = true
        await setCurrentStep('distance')
      }
    })
  } catch (error) {
    handleActionError(error, 'prepare')
  }
}

async function handleDistance() {
  if (!workspaceState.prepareHash || !workspaceState.prepareCompleted) {
    return
  }

  formErrorMessage.value = ''

  try {
    const response = await buildClusterDistance(workspaceState.prepareHash, workspaceState.selectedPhonemeMode)
    workspaceState.distanceTaskIdByMode[workspaceState.selectedPhonemeMode] = response.task_id || ''

    if (response.distance_hash) {
      workspaceState.distanceHashByMode[workspaceState.selectedPhonemeMode] = response.distance_hash
    }

    workspaceState.activeTask = {
      stage: 'distance',
      taskId: response.task_id || '',
      status: mapTaskStatus(response.status),
      progress: response.progress || 0,
      message: response.message || '',
      source: 'staged'
    }
    await setCurrentStep('distance')

    if (mapTaskStatus(response.status) === 'completed') {
      await setCurrentStep('cluster')
      return
    }

    await pollTaskUntilSettled('distance', response.task_id, {
      source: 'staged',
      onCompleted: async () => {
        await setCurrentStep('cluster')
      }
    })
  } catch (error) {
    handleActionError(error, 'distance')
  }
}

async function handleCluster() {
  if (!currentDistanceHash.value) {
    return
  }

  formErrorMessage.value = ''

  try {
    const clustering = buildClusteringPayload()
    const response = await runClusterStage(currentDistanceHash.value, clustering)
    const resultKey = buildResultKey(workspaceState.selectedPhonemeMode, clustering)

    workspaceState.resultTaskIdByKey[resultKey] = response.task_id || ''
    if (response.result_hash) {
      workspaceState.resultHashByKey[resultKey] = response.result_hash
    }

    workspaceState.activeResultSource = 'staged'
    workspaceState.activeTask = {
      stage: 'cluster',
      taskId: response.task_id || '',
      status: mapTaskStatus(response.status),
      progress: response.progress || 0,
      message: response.message || '',
      source: 'staged'
    }
    await setCurrentStep('cluster')

    if (mapTaskStatus(response.status) === 'completed') {
      await loadStagedResult(workspaceState.resultHashByKey[resultKey], true)
      return
    }

    await pollTaskUntilSettled('cluster', response.task_id, {
      source: 'staged',
      resultKey,
      onCompleted: async () => {
        await loadStagedResult(workspaceState.resultHashByKey[resultKey], true)
      }
    })
  } catch (error) {
    handleActionError(error, 'distance')
  }
}

async function handleQuickRun() {
  const validationError = validateRequestDraft()
  if (validationError) {
    formErrorMessage.value = validationError
    showWarning(validationError)
    return
  }

  try {
    const response = await runClusterJob({
      ...buildPreviewRequestDraft(),
      clustering: {
        ...buildClusteringPayload(),
        phoneme_mode: workspaceState.selectedPhonemeMode
      }
    })

    workspaceState.activeResultSource = 'jobs'
    workspaceState.activeTask = {
      stage: 'quick-run',
      taskId: response.task_id || '',
      status: mapTaskStatus(response.status),
      progress: response.progress || 0,
      message: response.message || '',
      source: 'jobs'
    }

    if (mapTaskStatus(response.status) === 'completed') {
      await loadQuickRunResult(response.task_id)
      return
    }

    await pollTaskUntilSettled('quick-run', response.task_id, {
      source: 'jobs',
      onCompleted: async () => {
        await loadQuickRunResult(response.task_id)
      }
    })
  } catch (error) {
    handleActionError(error, 'quick-run')
  }
}

async function pollTaskUntilSettled(stage, taskId, handlers = {}) {
  if (!taskId) {
    return
  }

  await taskPolling.start(() => getClusterJobStatus(taskId), {
    immediate: true,
    shouldStop: (status) => {
      const mappedStatus = mapTaskStatus(status.status)
      return mappedStatus === 'completed' || mappedStatus === 'failed'
    },
    onTick: async (status) => {
      const mappedStatus = mapTaskStatus(status.status)

      workspaceState.activeTask = {
        stage,
        taskId,
        status: mappedStatus,
        progress: status.progress || 0,
        message: status.message || '',
        source: handlers.source || workspaceState.activeTask.source || 'staged'
      }

      if (stage === 'distance' && status.distance_hash) {
        workspaceState.distanceHashByMode[workspaceState.selectedPhonemeMode] = status.distance_hash
      }

      if (stage === 'cluster' && handlers.resultKey && status.result_hash) {
        workspaceState.resultHashByKey[handlers.resultKey] = status.result_hash
      }

      if (mappedStatus === 'completed' && typeof handlers.onCompleted === 'function') {
        await handlers.onCompleted(status)
      }

      if (mappedStatus === 'failed') {
        formErrorMessage.value = status.message || t('cluster.errors.restart')
      }
    },
    onError: async (error) => {
      handleActionError(error, stage)
    }
  })
}

async function loadStagedResult(resultHash, advanceToResult = false) {
  if (!resultHash) {
    return
  }

  try {
    clusterResult.value = await getClusterStagedResult(resultHash)
    workspaceState.activeResultSource = 'staged'
    if (advanceToResult) {
      await setCurrentStep('result')
    }
  } catch (error) {
    handleActionError(error, 'cluster')
  }
}

async function loadQuickRunResult(taskId) {
  if (!taskId) {
    return
  }

  try {
    clusterResult.value = await getClusterJobResult(taskId)
    workspaceState.activeResultSource = 'jobs'
    await setCurrentStep('result')
  } catch (error) {
    handleActionError(error, 'quick-run')
  }
}

async function reloadCurrentResult() {
  if (workspaceState.activeResultSource === 'staged') {
    await loadStagedResult(currentResultHash.value, true)
    return
  }

  await loadQuickRunResult(workspaceState.activeTask.taskId)
}

function handleStageNotFound(stage) {
  switch (stage) {
    case 'prepare':
      workspaceState.prepareHash = ''
      clearDerivedStageState()
      formErrorMessage.value = t('cluster.errors.previewExpired')
      void setCurrentStep('preview')
      break
    case 'distance':
      workspaceState.distanceHashByMode[workspaceState.selectedPhonemeMode] = ''
      workspaceState.distanceTaskIdByMode[workspaceState.selectedPhonemeMode] = ''
      workspaceState.resultHashByKey[currentResultKey.value] = ''
      workspaceState.resultTaskIdByKey[currentResultKey.value] = ''
      clusterResult.value = null
      formErrorMessage.value = t('cluster.errors.distanceExpired')
      workspaceState.activeTask = createIdleActiveTask('staged')
      void setCurrentStep('distance')
      break
    case 'cluster':
      workspaceState.resultHashByKey[currentResultKey.value] = ''
      workspaceState.resultTaskIdByKey[currentResultKey.value] = ''
      clusterResult.value = null
      formErrorMessage.value = t('cluster.errors.resultExpired')
      workspaceState.activeTask = createIdleActiveTask('staged')
      void setCurrentStep('cluster')
      break
    default:
      formErrorMessage.value = t('cluster.errors.restart')
  }
}

function handleTaskNotFound(stage) {
  switch (stage) {
    case 'prepare':
      workspaceState.prepareTaskId = ''
      workspaceState.activeTask = createIdleActiveTask('staged')
      formErrorMessage.value = t('cluster.errors.taskExpired')
      void setCurrentStep('preview')
      break
    case 'distance':
      workspaceState.distanceTaskIdByMode[workspaceState.selectedPhonemeMode] = ''
      workspaceState.activeTask = createIdleActiveTask('staged')
      formErrorMessage.value = t('cluster.errors.taskExpired')
      void setCurrentStep('distance')
      break
    case 'cluster':
      workspaceState.resultTaskIdByKey[currentResultKey.value] = ''
      workspaceState.activeTask = createIdleActiveTask('staged')
      formErrorMessage.value = t('cluster.errors.taskExpired')
      void setCurrentStep('cluster')
      break
    case 'quick-run':
      workspaceState.activeTask = createIdleActiveTask('jobs')
      formErrorMessage.value = t('cluster.errors.taskExpired')
      break
    default:
      formErrorMessage.value = t('cluster.errors.taskExpired')
  }
}

function resolveNotFoundStage(error, fallbackStage) {
  const detail = resolveErrorMessage(error)

  if (detail.includes('任务不存在')) {
    return 'task'
  }

  if (detail.includes('result_hash') || detail.includes('result artifact')) {
    return 'cluster'
  }

  if (detail.includes('distance')) {
    return 'distance'
  }

  if (detail.includes('prepare')) {
    return 'prepare'
  }

  return fallbackStage
}

function handleActionError(error, fallbackStage) {
  if (error?.status === 404) {
    const notFoundStage = resolveNotFoundStage(error, fallbackStage)

    if (notFoundStage === 'task') {
      handleTaskNotFound(fallbackStage)
      return
    }

    handleStageNotFound(notFoundStage)
    return
  }

  if (error?.status === 409) {
    formErrorMessage.value = t('cluster.errors.taskConflict')
    return
  }

  if (error?.status === 422) {
    formErrorMessage.value = resolveErrorMessage(error)
    return
  }

  formErrorMessage.value = resolveErrorMessage(error) || t('cluster.errors.restart')
  showError(formErrorMessage.value)
}

function resolveErrorMessage(error) {
  if (typeof error?.detail === 'string' && error.detail.trim()) {
    return error.detail.trim()
  }

  if (error?.detail?.message && typeof error.detail.message === 'string') {
    return error.detail.message
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }

  return ''
}

function normalizePositiveInteger(value, fallbackValue) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallbackValue
  }
  return Math.round(numericValue)
}

function normalizeInteger(value, fallbackValue) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return fallbackValue
  }
  return Math.round(numericValue)
}

function normalizePositiveNumber(value, fallbackValue) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallbackValue
  }
  return numericValue
}

function formatNumeric(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '—'
  }
  return numericValue % 1 === 0 ? String(numericValue) : numericValue.toFixed(2)
}

function formatStructuredValue(value) {
  return JSON.stringify(value, null, 2)
}

function statusBadgeClass(status) {
  return {
    'is-completed': status === 'completed',
    'is-pending': status === 'pending' || status === 'processing',
    'is-idle': status === 'idle'
  }
}

function clearDerivedStageState() {
  workspaceState.prepareTaskId = ''
  workspaceState.prepareCompleted = false
  workspaceState.distanceHashByMode = {}
  workspaceState.distanceTaskIdByMode = {}
  workspaceState.resultHashByKey = {}
  workspaceState.resultTaskIdByKey = {}
  workspaceState.activeResultSource = 'staged'
  workspaceState.activeTask = createIdleActiveTask('staged')
}

function confirmResetWorkspace() {
  Object.assign(workspaceState, normalizeWorkspaceState(createDefaultWorkspaceState()))
  locationModel.value = {
    locations: [],
    regions: [],
    regionUsing: 'yindian'
  }
  clusterResult.value = null
  formErrorMessage.value = ''
  quickRunOpen.value = false
  showResetModal.value = false
  taskPolling.stop()
  removePersistedWorkspaceState()
  void setCurrentStep('input')
}

async function recoverWorkspace() {
  if (workspaceState.currentStep && STEP_ORDER.includes(workspaceState.currentStep) && workspaceState.currentStep !== currentStep.value) {
    await setCurrentStep(workspaceState.currentStep)
  }

  if (workspaceState.activeTask.taskId && isTaskBusy(workspaceState.activeTask.status)) {
    await pollTaskUntilSettled(workspaceState.activeTask.stage, workspaceState.activeTask.taskId, {
      source: workspaceState.activeTask.source,
      resultKey: currentResultKey.value,
      onCompleted: async () => {
        if (workspaceState.activeTask.source === 'jobs') {
          await loadQuickRunResult(workspaceState.activeTask.taskId)
          return
        }

        if (workspaceState.activeTask.stage === 'prepare') {
          workspaceState.prepareCompleted = true
          await setCurrentStep('distance')
        }

        if (workspaceState.activeTask.stage === 'distance') {
          await setCurrentStep('cluster')
        }

        if (workspaceState.activeTask.stage === 'cluster') {
          await loadStagedResult(currentResultHash.value, true)
        }
      }
    })
    return
  }

  if (workspaceState.activeResultSource === 'staged' && currentResultHash.value) {
    await loadStagedResult(currentResultHash.value, currentStep.value === 'result')
    return
  }

  if (workspaceState.activeResultSource === 'jobs' && workspaceState.activeTask.taskId && mapTaskStatus(workspaceState.activeTask.status) === 'completed') {
    await loadQuickRunResult(workspaceState.activeTask.taskId)
  }
}
</script>

<style scoped lang="scss">
.dialect-clustering-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  min-height: 100%;
}

.page-header,
.panel {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.page-header h1,
.panel-header h2,
.section-heading h3 {
  margin: 0;
  color: #1d1d1f;
}

.page-header p,
.panel-header p,
.section-heading p,
.section-note,
.preview-hint,
.task-message {
  margin: 6px 0 0;
  color: #51606f;
  line-height: 1.55;
}

.reset-btn,
.add-group-btn,
.reload-result-btn,
.group-remove-btn {
  width: auto;
}

.step-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
}

.step-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(0, 122, 255, 0.18);
  background: rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  padding: 10px 14px;
  color: #425466;
  cursor: not-allowed;
}

.step-pill.clickable {
  cursor: pointer;
}

.step-pill.active {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(224, 238, 255, 0.88));
  color: #0b3d91;
  border-color: rgba(0, 122, 255, 0.34);
}

.step-pill__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(0, 122, 255, 0.12);
  font-size: 12px;
  font-weight: 700;
}

.workflow-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
}

.workflow-main,
.workflow-side,
.groups-stack,
.result-stack,
.advanced-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header,
.group-panel__header,
.section-heading,
.quick-run-body {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.panel-alert {
  padding: 12px 14px;
  border-radius: 14px;
  margin-bottom: 16px;
}

.panel-alert--error {
  background: rgba(255, 59, 48, 0.12);
  border: 1px solid rgba(255, 59, 48, 0.18);
  color: #b42318;
}

.location-section,
.group-panel,
.summary-card,
.result-section,
.task-status-card,
.cluster-form,
.mode-panel {
  padding: 16px;
}

.inline-toggle-row {
  margin-top: 12px;
}

.inline-toggle {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  color: #334155;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field > span {
  color: #334155;
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.82);
  color: #1f2937;
}

.field textarea {
  resize: vertical;
}

.source-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.source-hint,
.preview-empty {
  margin: 0;
  color: #64748b;
}

.preview-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.54);
}

.preview-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 122, 255, 0.12);
  color: #0b57d0;
  font-size: 13px;
}

.panel-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.summary-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-card__label {
  color: #475569;
  font-size: 14px;
}

.summary-card strong,
.performance-row strong,
.task-row strong {
  color: #0f172a;
  font-size: 20px;
}

.hash-line,
.task-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.hash-line code,
.task-row code {
  display: inline-block;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #0f172a;
}

.status-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-badge.is-completed {
  background: rgba(52, 199, 89, 0.12);
  color: #207227;
}

.status-badge.is-pending {
  background: rgba(0, 122, 255, 0.12);
  color: #0b57d0;
}

.status-badge.is-idle {
  background: rgba(100, 116, 139, 0.16);
  color: #475569;
}

.quick-run-summary {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  font-weight: 700;
  color: #1d1d1f;
}

.quick-run-summary__label {
  color: #0b57d0;
}

.table-scroll {
  overflow: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.result-table th,
.result-table td {
  text-align: left;
  padding: 12px 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #334155;
}

.result-table th {
  color: #0f172a;
  font-weight: 700;
}

.diagnostic-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.diagnostic-card {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.66);
  padding: 14px;
}

.diagnostic-card h4 {
  margin: 0 0 10px;
  color: #0f172a;
}

.diagnostic-card pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #475569;
  font-size: 12px;
}

.performance-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.performance-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.task-status-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-shell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-track {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.22);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0a84ff, #5ac8fa);
  border-radius: inherit;
}

@media (max-width: 1080px) {
  .workflow-grid {
    grid-template-columns: 1fr;
  }

  .workflow-side {
    order: -1;
  }
}

@media (max-width: 768px) {
  .dialect-clustering-page {
    padding: 12px;
  }

  .page-header,
  .panel-header,
  .group-panel__header,
  .section-heading,
  .quick-run-summary {
    flex-direction: column;
  }

  .form-grid,
  .summary-card-grid {
    grid-template-columns: 1fr;
  }

  .panel-actions {
    justify-content: stretch;
  }

  .panel-actions > button,
  .quick-run-body > button {
    width: 100%;
  }
}
</style>

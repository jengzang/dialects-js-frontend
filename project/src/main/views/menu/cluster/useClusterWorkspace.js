import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClusterApi } from '@/api'
import { useStorageState } from '@/composables/core/useStorageState.js'
import { usePollingTask } from '@/composables/core/usePollingTask.js'
import { useQueryConfig } from '@/composables/domain/useQueryConfig.js'
import { useRouteQueryState } from '@/composables/router/useRouteQueryState.js'
import { showError, showSuccess, showWarning } from '@/utils/message.js'

export const QUICK_RUN_FALLBACK_LABEL = 'Quick Run'

const STEP_ORDER = ['input', 'preview', 'prepare', 'distance', 'cluster', 'result']
const STORAGE_KEY = 'cluster-workspace-v1'
const DEFAULT_GROUP_KEYS = ['攝']

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

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => typeof value === 'string' ? value.trim() : '')
    .filter(Boolean)
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

function mapTaskStatus(status) {
  if (status === 'queued') return 'pending'
  if (status === 'done') return 'completed'
  if (status === 'error') return 'failed'
  return status || 'idle'
}

function isTaskBusy(status) {
  return ['pending', 'processing', 'queued'].includes(status)
}

export function useClusterWorkspace() {
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

  const {
    state: persistedWorkspaceState,
    write: writePersistedWorkspaceState,
    remove: removePersistedWorkspaceState
  } = useStorageState(STORAGE_KEY, {
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
      .map((key) => ({
        key,
        values: Array.isArray(group.pathValueMap[key]) ? group.pathValueMap[key].filter(Boolean) : []
      }))
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

  return {
    QUICK_RUN_FALLBACK_LABEL,
    workspaceState,
    locationModel,
    formErrorMessage,
    clusterResult,
    quickRunOpen,
    showResetModal,
    locationInputDisabled,
    compareDimensionOptions,
    sourceModeOptions,
    phonemeModeOptions,
    algorithmOptions,
    linkageOptions,
    stepOptions,
    currentStep,
    prepareStepStatus,
    currentDistanceHash,
    currentResultHash,
    resultGroups,
    assignments,
    performanceEntries,
    cacheEntries,
    resultSummaryCards,
    showNClustersField,
    showRandomStateField,
    isPreviewPending,
    isPreparePending,
    isDistancePending,
    isClusterPending,
    isQuickRunPending,
    canReloadResult,
    availableKeys,
    exclusiveRules,
    singleSelectKeys,
    keyValueMap,
    goToStep,
    isStepReachable,
    addGroup,
    removeGroup,
    updateGroupPathKeys,
    updateGroupPathValueMap,
    getGroupPathStrings,
    getResolvedChars,
    handlePreview,
    handlePrepare,
    handleDistance,
    handleCluster,
    handleQuickRun,
    reloadCurrentResult,
    mapTaskStatus,
    formatNumeric,
    formatStructuredValue,
    statusBadgeClass,
    confirmResetWorkspace
  }
}

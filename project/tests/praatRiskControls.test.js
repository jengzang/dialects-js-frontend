import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testsDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testsDir, '..')

const praatViewPath = resolve(projectRoot, 'src/main/views/Praat.vue')
const audioInputPanelPath = resolve(projectRoot, 'src/main/components/praat/AudioInputPanel.vue')
const jobStatusPanelPath = resolve(projectRoot, 'src/main/components/praat/JobStatusPanel.vue')
const analysisResultsPanelPath = resolve(projectRoot, 'src/main/components/praat/AnalysisResultsPanel.vue')
const enLocalePath = resolve(projectRoot, 'src/i18n/locales/en/praat.json')
const zhCnLocalePath = resolve(projectRoot, 'src/i18n/locales/zh-CN/praat.json')
const zhHantLocalePath = resolve(projectRoot, 'src/i18n/locales/zh-Hant/praat.json')

function readSource(path) {
  return readFileSync(path, 'utf8')
}

describe('Praat front-end risk controls', () => {
  it('Praat view normalizes job states, blocks re-entry, and tracks run tokens', () => {
    const source = readSource(praatViewPath)

    expect(source).toContain('const analysisRunId = ref(0)')
    expect(source).toContain('const uploadSession = ref(createEmptyUploadSession())')
    expect(source).toContain('const normalizedJobStatus = computed(() => normalizeJobStatus(jobStatus.value))')
    expect(source).toContain('const shouldShowJobStatusPanel = computed(() => {')
    expect(source).toContain('const isActionLocked = computed(() => {')
    expect(source).toContain(":disabled=\"isActionLocked\"")
    expect(source).toContain('v-if="shouldShowJobStatusPanel"')
    expect(source).toContain("if (isUploading.value || isAnalyzing.value || isActiveJobStatus(normalizedJobStatus.value)) {")
    expect(source).toContain("const runId = beginAnalysisRun()")
    expect(source).toContain("if (!isCurrentRun(runId)) return")
    expect(source).toContain("const recoveryRunId = beginAnalysisRun()")
    expect(source).toContain("jobStage.value = t('praat.main.status.reusingUpload')")
    expect(source).toContain('if (isExpiredUploadError(error)) {')
    expect(source).toContain("@clear-selection=\"handleClearSelection\"")
  })

  it('Audio input emits structured file payloads and forwards clear-selection to the parent', () => {
    const source = readSource(audioInputPanelPath)

    expect(source).toContain("const emit = defineEmits(['file-selected', 'segments-ready', 'clear-selection'])")
    expect(source).toContain("emit('file-selected', {")
    expect(source).toContain("duration: duration")
    expect(source).toContain("origin: 'original'")
    expect(source).toContain("emit('clear-selection')")
  })

  it('Job status panel treats processing as active and renders canceled state explicitly', () => {
    const source = readSource(jobStatusPanelPath)

    expect(source).toContain("status === 'queued' || status === 'processing'")
    expect(source).toContain("status === 'canceled'")
    expect(source).toContain("t('praat.jobStatus.canceled.title')")
  })

  it('Analysis results panel exposes result context for job id and upload source', () => {
    const source = readSource(analysisResultsPanelPath)

    expect(source).toContain('context: {')
    expect(source).toContain("t('praat.results.context.jobLabel')")
    expect(source).toContain("t('praat.results.context.uploadSourceLabel')")
    expect(source).toContain("context.reusedUpload")
  })

  it('Praat locales include the new risk-control and result-context copy', () => {
    const enSource = readSource(enLocalePath)
    const zhCnSource = readSource(zhCnLocalePath)
    const zhHantSource = readSource(zhHantLocalePath)

    for (const source of [enSource, zhCnSource, zhHantSource]) {
      expect(source).toContain('"analysisInProgress"')
      expect(source).toContain('"reusingUpload"')
      expect(source).toContain('"uploadSourceLabel"')
      expect(source).toContain('"canceled"')
    }
  })
})

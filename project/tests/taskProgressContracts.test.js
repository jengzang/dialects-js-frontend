import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testsDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testsDir, '..')

const praatViewPath = resolve(projectRoot, 'src/main/views/Praat.vue')
const mergeViewPath = resolve(projectRoot, 'src/main/views/explore/tools/MergeTool.vue')
const jyutViewPath = resolve(projectRoot, 'src/main/views/explore/tools/Jyut2IpaTool.vue')
const pollingTaskPath = resolve(projectRoot, 'src/composables/core/usePollingTask.js')

function readSource(path) {
  return readFileSync(path, 'utf8')
}

describe('task progress contracts', () => {
  it('shared polling task serializes ticks and guards stale runs', () => {
    const source = readSource(pollingTaskPath)

    expect(source).toContain('let inFlight = false')
    expect(source).toContain('let runId = 0')
    expect(source).toContain('if (currentRunId !== runId || inFlight) return')
    expect(source).toContain('setTimeout(() => {')
    expect(source).not.toContain('setInterval(() => {')
  })

  it('Praat normalizes fraction progress into clamped integer percentages', () => {
    const source = readSource(praatViewPath)

    expect(source).toContain('const normalizeFractionProgress = (value) => {')
    expect(source).toContain('jobProgress.value = normalizeFractionProgress(status.progress)')
  })

  it('Merge and Jyut2Ipa normalize percent progress and stop on failed status', () => {
    const mergeSource = readSource(mergeViewPath)
    const jyutSource = readSource(jyutViewPath)

    for (const source of [mergeSource, jyutSource]) {
      expect(source).toContain("const isFailedProgressStatus = (status) => status === 'failed' || status === 'error'")
      expect(source).toContain('const normalizePercentProgress = (value) => {')
      expect(source).toContain('progress.value = normalizePercentProgress(progressData.progress)')
    }

    expect(mergeSource).not.toMatch(/\bprogress\.value = 10\b/)
    expect(jyutSource).not.toMatch(/\bprogress\.value = 10\b/)
    expect(jyutSource).not.toMatch(/\bprogress\.value = 20\b/)
  })
})

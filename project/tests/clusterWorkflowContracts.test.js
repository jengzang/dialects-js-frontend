import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testsDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testsDir, '..')

function readSource(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8')
}

describe('cluster workflow contracts', () => {
  it('replaces the placeholder page with the staged workflow workspace', () => {
    const source = readSource('src/main/views/menu/DialectClustering.vue')

    expect(source).toContain('LocationAndRegionInput')
    expect(source).toContain('usePollingTask')
    expect(source).toContain('useStorageState')
    expect(source).toContain('useRouteQueryState')
    expect(source).toContain('useClusterApi')
    expect(source).toContain('previewCluster')
    expect(source).toContain('prepareCluster')
    expect(source).toContain('buildClusterDistance')
    expect(source).toContain('runClusterStage')
    expect(source).toContain('runClusterJob')
    expect(source).toContain('getClusterStagedResult')
    expect(source).toContain('activeResultSource')
    expect(source).toContain('distanceHashByMode')
    expect(source).toContain('resultHashByKey')
    expect(source).toContain('Quick Run')
    expect(source).toContain('main-glass-panel')
  })
})

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testsDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testsDir, '..')

function readSource(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8')
}

describe('cluster request shape contracts', () => {
  it('builds grouped requests for path_strings and resolved_chars', () => {
    const source = readSource('src/main/views/menu/cluster/useClusterWorkspace.js')

    expect(source).toContain('function buildPreviewRequestDraft()')
    expect(source).toContain("source_mode: 'path_strings'")
    expect(source).toContain("compare_dimension: 'final'")
    expect(source).toContain("table_name: 'characters'")
    expect(source).toContain('path_strings:')
    expect(source).toContain('resolved_chars:')
    expect(source).toContain('include_special_locations')
    expect(source).toContain('phoneme_mode: workspaceState.selectedPhonemeMode')
  })

  it('branches clustering payloads by algorithm and maps staged rollback targets', () => {
    const source = readSource('src/main/views/menu/cluster/useClusterWorkspace.js')

    expect(source).toContain("algorithm === 'agglomerative'")
    expect(source).toContain("algorithm === 'dbscan'")
    expect(source).toContain("algorithm === 'kmeans'")
    expect(source).toContain("algorithm === 'gmm'")
    expect(source).toContain('n_clusters')
    expect(source).toContain('linkage')
    expect(source).toContain('eps')
    expect(source).toContain('min_samples')
    expect(source).toContain('random_state')
    expect(source).toContain('handleStageNotFound')
    expect(source).toContain("case 'prepare'")
    expect(source).toContain("case 'distance'")
    expect(source).toContain("case 'cluster'")
  })
})

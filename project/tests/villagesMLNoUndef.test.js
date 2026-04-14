import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testsDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testsDir, '..')
const eslintCli = resolve(projectRoot, 'node_modules/eslint/bin/eslint.js')

const targetFiles = [
  'src/VillagesML/workspace/VillagesMLWorkspace.vue',
  'src/VillagesML/workspace/modules/pattern/NgramStats.vue',
  'src/VillagesML/workspace/modules/regional/RegionalVectors.vue',
]

describe('VillagesML workspace regressions', () => {
  it('has no undefined variable errors in the checked workspace files', () => {
    expect(() => {
      execFileSync(process.execPath, [eslintCli, ...targetFiles, '--quiet'], {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      })
    }).not.toThrow()
  })
})

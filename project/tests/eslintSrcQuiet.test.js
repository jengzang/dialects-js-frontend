import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testsDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testsDir, '..')
const eslintCli = resolve(projectRoot, 'node_modules/eslint/bin/eslint.js')

describe('project eslint quiet', () => {
  it('has no ESLint errors under src', { timeout: 20000 }, () => {
    expect(() => {
      execFileSync(process.execPath, [eslintCli, 'src', '--ext', '.js,.vue', '--quiet'], {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      })
    }).not.toThrow()
  })
})

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const testsDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(testsDir, '..')
const hotspotMapPath = resolve(projectRoot, 'src/VillagesML/workspace/modules/spatial/HotspotMap.vue')

function readHotspotMapSource() {
  return readFileSync(hotspotMapPath, 'utf8')
}

describe('HotspotMap review fixes', () => {
  it('re-renders hotspot layers after style.load instead of styledata', () => {
    const source = readHotspotMapSource()

    expect(source).toContain("map.value.once('style.load'")
    expect(source).not.toContain("map.value.once('styledata'")
  })

  it('registers village layer interactions after the villages layer is created', () => {
    const source = readHotspotMapSource()
    const villagesLayerIndex = source.indexOf("id: 'villages-layer'")
    const clickHandlerIndex = source.indexOf("map.value.on('click', 'villages-layer'")
    const mouseEnterHandlerIndex = source.indexOf("map.value.on('mouseenter', 'villages-layer'")
    const mouseLeaveHandlerIndex = source.indexOf("map.value.on('mouseleave', 'villages-layer'")

    expect(villagesLayerIndex).toBeGreaterThan(-1)
    expect(clickHandlerIndex).toBeGreaterThan(villagesLayerIndex)
    expect(mouseEnterHandlerIndex).toBeGreaterThan(villagesLayerIndex)
    expect(mouseLeaveHandlerIndex).toBeGreaterThan(villagesLayerIndex)
  })
})

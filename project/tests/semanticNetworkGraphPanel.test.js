import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, nextTick, reactive } from 'vue'

const echartsMocks = vi.hoisted(() => {
  const setOption = vi.fn()
  const dispose = vi.fn()
  const resize = vi.fn()
  const init = vi.fn(() => ({
    setOption,
    dispose,
    resize,
  }))

  return { init, setOption, dispose, resize }
})

vi.mock('echarts', () => ({
  init: echartsMocks.init,
}))

import NetworkGraphPanel from '../src/VillagesML/workspace/modules/semantic/NetworkGraphPanel.vue'

function mountPanel(state) {
  const host = document.createElement('div')
  document.body.appendChild(host)

  const Root = defineComponent({
    components: { NetworkGraphPanel },
    setup() {
      return { state }
    },
    template: `
      <NetworkGraphPanel
        :network="state.network"
        :loading="state.loading"
        :detail-mode="state.detailMode"
      />
    `,
  })

  const app = createApp(Root)
  app.mount(host)

  return {
    unmount() {
      app.unmount()
      host.remove()
    },
  }
}

describe('NetworkGraphPanel', () => {
  afterEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders semantic network nodes without relying on an undefined maxDegree variable', async () => {
    const state = reactive({
      network: null,
      loading: false,
      detailMode: false,
    })

    const wrapper = mountPanel(state)

    state.network = {
      nodes: [
        { id: 'water', degree: 4 },
        { id: 'clan', degree: 2 },
      ],
      edges: [],
      communities: [
        { id: 0, size: 2, nodes: ['water', 'clan'] },
      ],
      node_count: 2,
      edge_count: 0,
    }

    await nextTick()
    await nextTick()

    expect(echartsMocks.setOption).toHaveBeenCalledTimes(1)

    const option = echartsMocks.setOption.mock.calls[0][0]
    const [largestNode, smallerNode] = option.series[0].data

    expect(largestNode.symbolSize).toBeCloseTo(60)
    expect(smallerNode.symbolSize).toBeCloseTo(40)

    wrapper.unmount()
  })
})

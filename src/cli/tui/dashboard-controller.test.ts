import { describe, expect, it, vi } from 'vitest'
import type { TuiRuntimePort } from './contracts'
import type { DashboardInputAction } from './dashboard-input'
import { runDashboardController } from './dashboard-controller'

describe('runDashboardController', () => {
  it('loads, refreshes through the runtime port, and exits cleanly', async () => {
    const loadWorkspaceCatalog = vi.fn<TuiRuntimePort['loadWorkspaceCatalog']>().mockResolvedValue({
      workspaces: [], totalCount: 0, truncated: false
    })
    const render = vi.fn()
    const unsubscribe = vi.fn()
    let emitInput: (action: DashboardInputAction) => void = () => {}
    const running = runDashboardController({ loadWorkspaceCatalog }, {
      render,
      subscribeInput(listener) {
        emitInput = listener
        return unsubscribe
      }
    })
    await vi.waitFor(() => expect(render).toHaveBeenCalledOnce())
    emitInput({ type: 'refresh' })
    await vi.waitFor(() => expect(loadWorkspaceCatalog).toHaveBeenCalledTimes(2))
    emitInput({ type: 'exit' })
    await running
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})

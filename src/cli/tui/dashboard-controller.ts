import type { TuiRuntimePort } from './contracts'
import type { DashboardInputAction } from './dashboard-input'
import { createDashboardState, reduceDashboardState } from './dashboard-state'
import { buildDashboardViewModel, type DashboardViewModel } from './dashboard-view-model'

export type DashboardSurface = {
  render(view: DashboardViewModel): void
  subscribeInput(listener: (action: DashboardInputAction) => void): () => void
}

export async function runDashboardController(
  runtime: TuiRuntimePort,
  surface: DashboardSurface
): Promise<void> {
  let state = createDashboardState(await runtime.loadWorkspaceCatalog())
  surface.render(buildDashboardViewModel(state, 'connected'))

  await new Promise<void>((resolve, reject) => {
    let refreshing = false
    let settled = false
    let unsubscribe = (): void => {}

    const finish = (error?: unknown): void => {
      if (settled) {
        return
      }
      settled = true
      unsubscribe()
      if (error === undefined) {
        resolve()
      } else {
        reject(error)
      }
    }

    unsubscribe = surface.subscribeInput((action) => {
      if (action.type === 'exit') {
        finish()
        return
      }
      if (action.type === 'move-selection') {
        state = reduceDashboardState(state, action)
        surface.render(buildDashboardViewModel(state, 'connected'))
        return
      }
      if (refreshing) {
        return
      }

      refreshing = true
      void runtime.loadWorkspaceCatalog()
        .then((catalog) => {
          if (settled) {
            return
          }
          state = reduceDashboardState(state, { type: 'replace-catalog', catalog })
          surface.render(buildDashboardViewModel(state, 'connected'))
        })
        .catch((error: unknown) => {
          if (settled) {
            return
          }
          surface.render(buildDashboardViewModel(state, 'unavailable'))
          finish(error)
        })
        .finally(() => {
          refreshing = false
        })
    })
  })
}

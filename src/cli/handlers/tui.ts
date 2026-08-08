import type { CommandHandler } from '../dispatch'
import { RuntimeClientError } from '../runtime/types'
import { runProcessDashboard } from '../tui/process-dashboard'
import { createRuntimeWorkspaceCatalogPort } from '../tui/runtime-workspace-catalog-port'

export const TUI_HANDLERS: Record<string, CommandHandler> = {
  tui: async ({ client, json }) => {
    if (json) {
      throw new RuntimeClientError(
        'invalid_argument',
        'orca tui is interactive and does not emit JSON.'
      )
    }
    await runProcessDashboard(createRuntimeWorkspaceCatalogPort(client))
  }
}

import type { RuntimeWorktreePsResult } from '../../shared/runtime-types'
import type { TuiRuntimePort } from './contracts'
import { projectWorkspaceCatalog } from './workspace-catalog'

type RuntimeCallResponse<TResult> = { result: TResult }

export type WorkspaceCatalogRuntimeClient = {
  call<TResult>(method: string, params?: unknown): Promise<RuntimeCallResponse<TResult>>
}

export function createRuntimeWorkspaceCatalogPort(
  client: WorkspaceCatalogRuntimeClient
): TuiRuntimePort {
  return {
    async loadWorkspaceCatalog() {
      const response = await client.call<RuntimeWorktreePsResult>('worktree.ps', {})
      return projectWorkspaceCatalog(response.result)
    }
  }
}

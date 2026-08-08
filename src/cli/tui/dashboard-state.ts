import type { TuiWorkspaceCatalog } from './contracts'

export type DashboardState = {
  catalog: TuiWorkspaceCatalog
  selectedWorkspaceId: string | null
}

export type DashboardStateAction =
  | { type: 'move-selection'; delta: number }
  | { type: 'replace-catalog'; catalog: TuiWorkspaceCatalog }

export function createDashboardState(catalog: TuiWorkspaceCatalog): DashboardState {
  return { catalog, selectedWorkspaceId: catalog.workspaces[0]?.id ?? null }
}

export function reduceDashboardState(
  state: DashboardState,
  action: DashboardStateAction
): DashboardState {
  if (action.type === 'replace-catalog') {
    const selectionExists = action.catalog.workspaces.some(
      (workspace) => workspace.id === state.selectedWorkspaceId
    )
    return {
      catalog: action.catalog,
      selectedWorkspaceId: selectionExists
        ? state.selectedWorkspaceId
        : (action.catalog.workspaces[0]?.id ?? null)
    }
  }
  if (state.catalog.workspaces.length === 0) {
    return { ...state, selectedWorkspaceId: null }
  }
  const currentIndex = Math.max(
    0,
    state.catalog.workspaces.findIndex((workspace) => workspace.id === state.selectedWorkspaceId)
  )
  const targetIndex = Math.max(
    0,
    Math.min(state.catalog.workspaces.length - 1, currentIndex + action.delta)
  )
  return { ...state, selectedWorkspaceId: state.catalog.workspaces[targetIndex]?.id ?? null }
}

import type { TuiAgentState, TuiWorkspaceAgent, TuiWorkspaceStatus } from './contracts'
import type { DashboardState } from './dashboard-state'

export type DashboardRuntimeState = 'connected' | 'connecting' | 'unavailable'

export type DashboardWorkspaceRow = {
  kind: 'workspace'
  id: string
  label: string
  branch: string | null
  status: TuiWorkspaceStatus
  selected: boolean
  active: boolean
  unread: boolean
  terminalCount: number
}

export type DashboardAgentRow = {
  kind: 'agent'
  paneKey: string
  depth: number
  label: string
  agentType: string | null
  state: TuiAgentState
  interrupted: boolean
}

export type DashboardEmptyRow = {
  kind: 'empty'
  label: string
}

export type DashboardViewModel = {
  header: {
    product: 'ORCA TUI'
    runtime: DashboardRuntimeState
  }
  rows: (DashboardWorkspaceRow | DashboardAgentRow | DashboardEmptyRow)[]
  footer: string
}

function agentDepth(agent: TuiWorkspaceAgent, agents: TuiWorkspaceAgent[]): number {
  const byPaneKey = new Map(agents.map((candidate) => [candidate.paneKey, candidate]))
  const visited = new Set<string>([agent.paneKey])
  let parentPaneKey = agent.parentPaneKey
  let depth = 0

  while (parentPaneKey !== null) {
    if (visited.has(parentPaneKey)) {
      break
    }
    const parent = byPaneKey.get(parentPaneKey)
    if (parent === undefined) {
      break
    }
    visited.add(parentPaneKey)
    depth += 1
    parentPaneKey = parent.parentPaneKey
  }
  return depth
}

function agentLabel(agent: TuiWorkspaceAgent): string {
  return agent.displayName ?? agent.taskTitle ?? agent.agentType ?? 'agent'
}

export function buildDashboardViewModel(
  state: DashboardState,
  runtime: DashboardRuntimeState
): DashboardViewModel {
  const header: DashboardViewModel['header'] = { product: 'ORCA TUI', runtime }
  const footer = 'j/k navigate  r refresh  q quit'

  if (state.catalog.workspaces.length === 0) {
    return { header, rows: [{ kind: 'empty', label: 'No workspaces' }], footer }
  }

  return {
    header,
    rows: state.catalog.workspaces.flatMap((workspace) => [
      {
        kind: 'workspace' as const,
        id: workspace.id,
        label: workspace.name,
        branch: workspace.branch,
        status: workspace.status,
        selected: workspace.id === state.selectedWorkspaceId,
        active: workspace.active,
        unread: workspace.unread,
        terminalCount: workspace.liveTerminalCount
      },
      ...workspace.agents.map((agent) => ({
        kind: 'agent' as const,
        paneKey: agent.paneKey,
        depth: agentDepth(agent, workspace.agents),
        label: agentLabel(agent),
        agentType: agent.agentType,
        state: agent.state,
        interrupted: agent.interrupted
      }))
    ]),
    footer
  }
}

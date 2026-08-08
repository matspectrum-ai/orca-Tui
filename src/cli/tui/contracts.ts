import type { AgentStatusState } from '../../shared/agent-status-types'
import type { RuntimeWorktreeAgentRow, RuntimeWorktreeStatus } from '../../shared/runtime-types'

export type TuiWorkspaceStatus = RuntimeWorktreeStatus | 'unknown'
export type TuiAgentState = AgentStatusState | 'unknown'
export type TuiWorkspaceKind = 'git-worktree' | 'folder-workspace'

export type TuiWorkspaceAgent = Omit<RuntimeWorktreeAgentRow, 'state'> & {
  state: TuiAgentState
}

export type TuiWorkspaceCatalogItem = {
  id: string
  kind: TuiWorkspaceKind
  repoId: string
  hostId?: string
  terminalPlatform?: NodeJS.Platform
  repo: string
  path: string
  branch: string | null
  name: string
  isArchived: boolean
  isMainWorktree: boolean
  hasHostSidebarActivity: boolean
  parentWorktreeId: string | null
  childWorktreeIds: string[]
  workspaceStatus: string
  sortOrder: number
  manualOrder?: number
  lastActivityAt?: number
  createdAt?: number
  linkedIssue: number | null
  linkedPR: { number: number; state: string } | null
  linkedLinearIssue: string | null
  linkedGitLabMR: number | null
  linkedGitLabIssue: number | null
  comment: string
  isPinned: boolean
  active: boolean
  unread: boolean
  liveTerminalCount: number
  hasAttachedPty: boolean
  lastOutputAt: number | null
  preview: string
  status: TuiWorkspaceStatus
  agents: TuiWorkspaceAgent[]
}

export type TuiWorkspaceCatalog = {
  workspaces: TuiWorkspaceCatalogItem[]
  totalCount: number
  truncated: boolean
}

export type TuiRuntimePort = {
  loadWorkspaceCatalog(): Promise<TuiWorkspaceCatalog>
}

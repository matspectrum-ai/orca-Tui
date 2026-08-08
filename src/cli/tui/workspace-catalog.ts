import type { AgentStatusState } from '../../shared/agent-status-types'
import type {
  RuntimeWorktreeAgentRow,
  RuntimeWorktreePsResult,
  RuntimeWorktreePsSummary,
  RuntimeWorktreeStatus
} from '../../shared/runtime-types'
import type {
  TuiAgentState,
  TuiWorkspaceAgent,
  TuiWorkspaceCatalog,
  TuiWorkspaceCatalogItem,
  TuiWorkspaceStatus
} from './contracts'

const WORKTREE_STATUSES = new Set<RuntimeWorktreeStatus>([
  'active',
  'working',
  'permission',
  'done',
  'inactive'
])
const AGENT_STATES = new Set<AgentStatusState>(['working', 'blocked', 'waiting', 'done'])

function normalizeWorkspaceStatus(status: string): TuiWorkspaceStatus {
  return WORKTREE_STATUSES.has(status as RuntimeWorktreeStatus)
    ? (status as RuntimeWorktreeStatus)
    : 'unknown'
}

function normalizeAgentState(state: string): TuiAgentState {
  return AGENT_STATES.has(state as AgentStatusState) ? (state as AgentStatusState) : 'unknown'
}

function projectAgent(agent: RuntimeWorktreeAgentRow): TuiWorkspaceAgent {
  return { ...agent, state: normalizeAgentState(agent.state) }
}

function projectWorkspace(worktree: RuntimeWorktreePsSummary): TuiWorkspaceCatalogItem {
  const folderWorkspace = worktree.workspaceKind === 'folder-workspace'
  return {
    id: worktree.worktreeId,
    kind: folderWorkspace ? 'folder-workspace' : 'git-worktree',
    repoId: worktree.repoId,
    hostId: worktree.hostId,
    terminalPlatform: worktree.terminalPlatform,
    repo: worktree.repo,
    path: worktree.path,
    branch: folderWorkspace || worktree.branch.length === 0 ? null : worktree.branch,
    name: worktree.displayName,
    isArchived: worktree.isArchived,
    isMainWorktree: worktree.isMainWorktree,
    hasHostSidebarActivity: worktree.hasHostSidebarActivity,
    parentWorktreeId: worktree.parentWorktreeId,
    childWorktreeIds: [...worktree.childWorktreeIds],
    workspaceStatus: worktree.workspaceStatus,
    sortOrder: worktree.sortOrder,
    manualOrder: worktree.manualOrder,
    lastActivityAt: worktree.lastActivityAt,
    createdAt: worktree.createdAt,
    linkedIssue: worktree.linkedIssue,
    linkedPR: worktree.linkedPR,
    linkedLinearIssue: worktree.linkedLinearIssue,
    linkedGitLabMR: worktree.linkedGitLabMR,
    linkedGitLabIssue: worktree.linkedGitLabIssue,
    comment: worktree.comment,
    isPinned: worktree.isPinned,
    active: worktree.isActive,
    unread: worktree.unread,
    liveTerminalCount: worktree.liveTerminalCount,
    hasAttachedPty: worktree.hasAttachedPty,
    lastOutputAt: worktree.lastOutputAt,
    preview: worktree.preview,
    status: normalizeWorkspaceStatus(worktree.status),
    agents: worktree.agents.map(projectAgent)
  }
}

export function projectWorkspaceCatalog(result: RuntimeWorktreePsResult): TuiWorkspaceCatalog {
  return {
    workspaces: result.worktrees.map(projectWorkspace),
    totalCount: result.totalCount,
    truncated: result.truncated
  }
}

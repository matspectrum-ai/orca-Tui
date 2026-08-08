import { describe, expect, it } from 'vitest'
import type { TuiWorkspaceCatalogItem } from './contracts'
import { createDashboardState } from './dashboard-state'
import { buildDashboardViewModel } from './dashboard-view-model'

function workspace(): TuiWorkspaceCatalogItem {
  return {
    id: 'w1', kind: 'git-worktree', repoId: 'repo', repo: 'orca', path: '/repo/w1',
    branch: 'feature/tui', name: 'TUI', isArchived: false, isMainWorktree: false,
    hasHostSidebarActivity: true, parentWorktreeId: null, childWorktreeIds: [],
    workspaceStatus: 'in-progress', sortOrder: 0, linkedIssue: null, linkedPR: null,
    linkedLinearIssue: null, linkedGitLabMR: null, linkedGitLabIssue: null, comment: '', isPinned: false,
    active: true, unread: true, liveTerminalCount: 1, hasAttachedPty: true, lastOutputAt: 1,
    preview: 'working', status: 'working', agents: [{
      paneKey: 'p1', parentPaneKey: null, state: 'working', agentType: 'codex', prompt: '',
      taskTitle: null, displayName: 'Builder', lastAssistantMessage: null, toolName: null,
      toolInput: null, interrupted: false, stateStartedAt: 1, updatedAt: 2
    }]
  }
}

describe('buildDashboardViewModel', () => {
  it('keeps workspace and agent semantics ANSI-free', () => {
    const state = createDashboardState({ workspaces: [workspace()], totalCount: 1, truncated: false })
    const view = buildDashboardViewModel(state, 'connected')
    expect(view.header).toEqual({ product: 'ORCA TUI', runtime: 'connected' })
    expect(view.rows).toEqual([
      expect.objectContaining({ kind: 'workspace', selected: true, label: 'TUI' }),
      expect.objectContaining({ kind: 'agent', label: 'Builder', state: 'working' })
    ])
    expect(JSON.stringify(view)).not.toContain(`${String.fromCharCode(27)}[`)
  })
})

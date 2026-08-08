import { describe, expect, it } from 'vitest'
import type { TuiWorkspaceCatalogItem } from './contracts'
import { createDashboardState, reduceDashboardState } from './dashboard-state'

function workspace(id: string): TuiWorkspaceCatalogItem {
  return {
    id, kind: 'git-worktree', repoId: 'repo', repo: 'orca', path: `/repo/${id}`, branch: id, name: id,
    isArchived: false, isMainWorktree: false, hasHostSidebarActivity: false, parentWorktreeId: null,
    childWorktreeIds: [], workspaceStatus: 'in-progress', sortOrder: 0, linkedIssue: null, linkedPR: null,
    linkedLinearIssue: null, linkedGitLabMR: null, linkedGitLabIssue: null, comment: '', isPinned: false,
    active: false, unread: false, liveTerminalCount: 0, hasAttachedPty: false, lastOutputAt: null,
    preview: '', status: 'inactive', agents: []
  }
}

describe('dashboard state', () => {
  it('navigates by stable identity and preserves selection on refresh', () => {
    let state = createDashboardState({ workspaces: [workspace('a'), workspace('b')], totalCount: 2, truncated: false })
    state = reduceDashboardState(state, { type: 'move-selection', delta: 1 })
    expect(state.selectedWorkspaceId).toBe('b')
    state = reduceDashboardState(state, {
      type: 'replace-catalog',
      catalog: { workspaces: [workspace('b'), workspace('c')], totalCount: 2, truncated: false }
    })
    expect(state.selectedWorkspaceId).toBe('b')
  })

  it('keeps an empty catalog selection-free', () => {
    const state = createDashboardState({ workspaces: [], totalCount: 0, truncated: false })
    expect(reduceDashboardState(state, { type: 'move-selection', delta: 1 }).selectedWorkspaceId).toBeNull()
  })
})

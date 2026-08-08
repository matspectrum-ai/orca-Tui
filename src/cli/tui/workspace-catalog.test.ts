import { describe, expect, it } from 'vitest'
import type { RuntimeWorktreePsSummary } from '../../shared/runtime-types'
import { projectWorkspaceCatalog } from './workspace-catalog'

function worktree(overrides: Partial<RuntimeWorktreePsSummary> = {}): RuntimeWorktreePsSummary {
  return {
    worktreeId: 'repo::/wt', repoId: 'repo', repo: 'orca', path: '/wt', branch: 'feature/tui',
    isArchived: false, isMainWorktree: false, hasHostSidebarActivity: true,
    parentWorktreeId: null, childWorktreeIds: [], displayName: 'TUI', workspaceStatus: 'in-progress',
    sortOrder: 0, linkedIssue: null, linkedPR: null, linkedLinearIssue: null, linkedGitLabMR: null,
    linkedGitLabIssue: null, comment: '', isPinned: false, isActive: true, unread: false,
    liveTerminalCount: 1, hasAttachedPty: true, lastOutputAt: 1, preview: 'working', status: 'working',
    agents: [], ...overrides
  }
}

describe('projectWorkspaceCatalog', () => {
  it('preserves Orca worktree and agent truth', () => {
    const result = projectWorkspaceCatalog({
      worktrees: [worktree({ agents: [{
        paneKey: 'parent', parentPaneKey: null, state: 'working', agentType: 'codex', prompt: 'Build',
        taskTitle: null, displayName: 'Builder', lastAssistantMessage: null, toolName: null,
        toolInput: null, interrupted: false, stateStartedAt: 1, updatedAt: 2
      }, {
        paneKey: 'child', parentPaneKey: 'parent', state: 'waiting', agentType: 'claude', prompt: '',
        taskTitle: null, displayName: null, lastAssistantMessage: null, toolName: null,
        toolInput: null, interrupted: false, stateStartedAt: 1, updatedAt: 2
      }] })],
      totalCount: 1,
      truncated: false
    })
    expect(result.workspaces[0]).toMatchObject({
      id: 'repo::/wt', kind: 'git-worktree', branch: 'feature/tui', status: 'working',
      agents: [
        expect.objectContaining({ paneKey: 'parent', state: 'working' }),
        expect.objectContaining({ paneKey: 'child', parentPaneKey: 'parent', state: 'waiting' })
      ]
    })
  })

  it('keeps folder workspaces branchless and future states neutral', () => {
    const result = projectWorkspaceCatalog({
      worktrees: [worktree({
        workspaceKind: 'folder-workspace', branch: '', status: 'future' as RuntimeWorktreePsSummary['status']
      })],
      totalCount: 1,
      truncated: true
    })
    expect(result.workspaces[0]).toMatchObject({ kind: 'folder-workspace', branch: null, status: 'unknown' })
    expect(result.truncated).toBe(true)
  })
})

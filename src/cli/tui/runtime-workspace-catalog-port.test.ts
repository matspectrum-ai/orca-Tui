import { describe, expect, it, vi } from 'vitest'
import { createRuntimeWorkspaceCatalogPort } from './runtime-workspace-catalog-port'

describe('createRuntimeWorkspaceCatalogPort', () => {
  it('performs exactly one worktree.ps call per load', async () => {
    const call = vi.fn().mockResolvedValue({
      result: { worktrees: [], totalCount: 0, truncated: false }
    })
    const port = createRuntimeWorkspaceCatalogPort({ call })
    await expect(port.loadWorkspaceCatalog()).resolves.toMatchObject({ totalCount: 0 })
    expect(call).toHaveBeenCalledOnce()
    expect(call).toHaveBeenCalledWith('worktree.ps', {})
  })
})

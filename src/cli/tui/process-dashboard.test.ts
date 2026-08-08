import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import type { TuiRuntimePort } from './contracts'
import { runProcessDashboard } from './process-dashboard'

class FakeInput extends EventEmitter {
  isTTY = true
  isRaw = false
  setRawMode = vi.fn((raw: boolean) => { this.isRaw = raw })
  resume = vi.fn()
  pause = vi.fn()
}

class FakeOutput extends EventEmitter {
  isTTY = true
  columns = 80
  rows = 12
  writes: string[] = []
  write = vi.fn((chunk: string) => { this.writes.push(chunk); return true })
}

describe('runProcessDashboard', () => {
  it('restores raw mode, cursor, screen, and listeners after q', async () => {
    const stdin = new FakeInput()
    const stdout = new FakeOutput()
    const runtime: TuiRuntimePort = { loadWorkspaceCatalog: vi.fn().mockResolvedValue({
      workspaces: [], totalCount: 0, truncated: false
    }) }
    const running = runProcessDashboard(runtime, { stdin, stdout, emitKeypressEvents: vi.fn() })
    await vi.waitFor(() => expect(stdout.writes.join('')).toContain('ORCA TUI'))
    stdin.emit('keypress', 'q', { name: 'q' })
    await running
    expect(stdin.setRawMode).toHaveBeenNthCalledWith(1, true)
    expect(stdin.setRawMode).toHaveBeenLastCalledWith(false)
    expect(stdout.writes[0]).toContain('\u001b[?1049h')
    expect(stdout.writes.at(-1)).toContain('\u001b[?1049l')
    expect(stdin.listenerCount('keypress')).toBe(0)
  })
})

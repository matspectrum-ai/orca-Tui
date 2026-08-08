import { describe, expect, it } from 'vitest'
import type { DashboardViewModel } from './dashboard-view-model'
import { renderAnsiDashboardFrame } from './ansi-dashboard-frame'

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;?]*[ -/]*[@-~]`, 'g')

describe('renderAnsiDashboardFrame', () => {
  it('uses canonical Orca dark colors and stays within viewport', () => {
    const view: DashboardViewModel = {
      header: { product: 'ORCA TUI', runtime: 'connected' },
      rows: [{
        kind: 'workspace', id: 'w1', label: 'TUI', branch: 'feature/tui', status: 'working',
        selected: true, active: true, unread: false, terminalCount: 1
      }],
      footer: 'j/k navigate  r refresh  q quit'
    }
    const frame = renderAnsiDashboardFrame(view, { width: 60, height: 8 })
    const plain = frame.replace(ANSI, '')
    expect(plain).toContain('ORCA TUI')
    expect(plain.split('\n')).toHaveLength(8)
    expect(plain.split('\n').every((line) => line.length <= 60)).toBe(true)
    expect(frame).toContain('\u001b[38;2;250;250;250m')
    expect(frame).toContain('\u001b[48;2;38;38;38m')
  })
})

import { describe, expect, it } from 'vitest'
import { mapDashboardKey } from './dashboard-input'

describe('mapDashboardKey', () => {
  it('maps navigation, refresh, and exit', () => {
    expect(mapDashboardKey('j', { name: 'j' })).toEqual({ type: 'move-selection', delta: 1 })
    expect(mapDashboardKey(undefined, { name: 'up' })).toEqual({ type: 'move-selection', delta: -1 })
    expect(mapDashboardKey('r', { name: 'r' })).toEqual({ type: 'refresh' })
    expect(mapDashboardKey(undefined, { name: 'c', ctrl: true })).toEqual({ type: 'exit' })
  })

  it('ignores incomplete key metadata', () => {
    expect(mapDashboardKey(undefined, undefined)).toBeNull()
    expect(mapDashboardKey('', {})).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { HANDLER_GROUPS } from '../handler-group-manifest'
import { COMMAND_SPECS } from '../specs'

describe('orca tui registration', () => {
  it('registers a dedicated interactive command', () => {
    expect(COMMAND_SPECS.find((spec) => spec.path.join(' ') === 'tui')).toMatchObject({
      path: ['tui'], usage: 'orca tui'
    })
    expect(HANDLER_GROUPS.find((group) => group.name === 'tui')?.keys).toEqual(['tui'])
  })
})

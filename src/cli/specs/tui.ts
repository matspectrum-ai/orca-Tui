import { GLOBAL_FLAGS, type CommandSpec } from '../args'

export const TUI_COMMAND_SPECS: CommandSpec[] = [{
  path: ['tui'],
  summary: 'Open the terminal-native Orca interface',
  usage: 'orca tui',
  allowedFlags: [...GLOBAL_FLAGS],
  notes: [
    'Connects to the selected Orca runtime without opening the desktop UI.',
    'The current foundation does not auto-start a missing local runtime.'
  ],
  examples: ['orca tui']
}]

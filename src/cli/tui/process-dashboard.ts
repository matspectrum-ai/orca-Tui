import { emitKeypressEvents as nodeEmitKeypressEvents } from 'node:readline'
import type { TuiRuntimePort } from './contracts'
import { runDashboardController, type DashboardSurface } from './dashboard-controller'
import type { DashboardInputAction, DashboardKey } from './dashboard-input'
import { mapDashboardKey } from './dashboard-input'
import { renderAnsiDashboardFrame } from './ansi-dashboard-frame'
import type { DashboardViewModel } from './dashboard-view-model'

type ProcessDashboardInput = {
  isTTY?: boolean
  isRaw?: boolean
  setRawMode?(raw: boolean): void
  resume(): void
  pause?(): void
  on(event: 'keypress', listener: (sequence: string | undefined, key: DashboardKey | undefined) => void): void
  off(event: 'keypress', listener: (sequence: string | undefined, key: DashboardKey | undefined) => void): void
}

type ProcessDashboardOutput = {
  isTTY?: boolean
  columns?: number
  rows?: number
  write(chunk: string): unknown
  on(event: 'resize', listener: () => void): void
  off(event: 'resize', listener: () => void): void
}

export type ProcessDashboardOptions = {
  stdin?: ProcessDashboardInput
  stdout?: ProcessDashboardOutput
  emitKeypressEvents?: (input: ProcessDashboardInput) => void
}

const ENTER_SCREEN = '\u001b[?1049h\u001b[?25l\u001b[2J\u001b[H'
const LEAVE_SCREEN = '\u001b[0m\u001b[?25h\u001b[?1049l'

export async function runProcessDashboard(
  runtime: TuiRuntimePort,
  options: ProcessDashboardOptions = {}
): Promise<void> {
  const stdin = options.stdin ?? (process.stdin as unknown as ProcessDashboardInput)
  const stdout = options.stdout ?? (process.stdout as unknown as ProcessDashboardOutput)
  if (stdin.isTTY !== true || stdout.isTTY !== true) {
    throw new Error('orca tui requires an interactive TTY.')
  }

  const emitKeypressEvents = options.emitKeypressEvents ?? ((input: ProcessDashboardInput) => {
    nodeEmitKeypressEvents(input as unknown as NodeJS.ReadStream)
  })
  const previousRawMode = stdin.isRaw === true
  let currentView: DashboardViewModel | null = null
  let inputListener: ((action: DashboardInputAction) => void) | null = null

  const renderCurrent = (): void => {
    if (currentView === null) {
      return
    }
    stdout.write('\u001b[H')
    stdout.write(renderAnsiDashboardFrame(currentView, {
      width: stdout.columns ?? 80,
      height: stdout.rows ?? 24
    }))
  }
  const onKeypress = (sequence: string | undefined, key: DashboardKey | undefined): void => {
    const action = mapDashboardKey(sequence, key)
    if (action !== null) {
      inputListener?.(action)
    }
  }
  const onResize = (): void => {
    renderCurrent()
  }
  const surface: DashboardSurface = {
    render(view) {
      currentView = view
      renderCurrent()
    },
    subscribeInput(listener) {
      inputListener = listener
      stdin.on('keypress', onKeypress)
      return () => {
        inputListener = null
        stdin.off('keypress', onKeypress)
      }
    }
  }

  stdout.write(ENTER_SCREEN)
  emitKeypressEvents(stdin)
  stdin.setRawMode?.(true)
  stdin.resume()
  stdout.on('resize', onResize)
  try {
    await runDashboardController(runtime, surface)
  } finally {
    stdin.off('keypress', onKeypress)
    stdout.off('resize', onResize)
    stdin.setRawMode?.(previousRawMode)
    stdin.pause?.()
    stdout.write(LEAVE_SCREEN)
  }
}

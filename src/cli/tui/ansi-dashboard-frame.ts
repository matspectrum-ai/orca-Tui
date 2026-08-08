import type {
  DashboardAgentRow,
  DashboardViewModel,
  DashboardWorkspaceRow
} from './dashboard-view-model'

const RESET = '\u001b[0m'

const ORCA_DARK = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  mutedForeground: '#a1a1a1',
  sidebar: '#171717',
  sidebarAccent: '#262626'
} as const

type Viewport = { width: number; height: number }

function rgbSequence(hex: string, foreground: boolean): string {
  const value = Number.parseInt(hex.slice(1), 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return `\u001b[${foreground ? 38 : 48};2;${red};${green};${blue}m`
}

function sanitize(text: string): string {
  return Array.from(text, (character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint < 32 || (codePoint >= 127 && codePoint <= 159) ? ' ' : character
  }).join('')
}

function fit(text: string, width: number): string {
  if (width <= 0) {
    return ''
  }
  const clean = sanitize(text)
  if (clean.length > width) {
    return width === 1 ? '…' : `${clean.slice(0, width - 1)}…`
  }
  return clean.padEnd(width)
}

function paint(text: string, width: number, foreground: string, background: string): string {
  return `${rgbSequence(foreground, true)}${rgbSequence(background, false)}${fit(text, width)}${RESET}`
}

function workspaceText(row: DashboardWorkspaceRow): string {
  const cursor = row.selected ? '›' : ' '
  const activity = row.unread ? '•' : row.active ? '●' : '○'
  const branch = row.branch === null ? '' : ` / ${row.branch}`
  const terminals = row.terminalCount === 0 ? '' : `  term:${row.terminalCount}`
  return ` ${cursor} ${activity} ${row.label}${branch}  ${row.status}${terminals}`
}

function agentText(row: DashboardAgentRow): string {
  const indentation = '  '.repeat(row.depth + 1)
  const agentType = row.agentType === null ? '' : ` · ${row.agentType}`
  const interrupted = row.interrupted ? ' · interrupted' : ''
  return `${indentation}└─ ${row.label}${agentType}  ${row.state}${interrupted}`
}

function contentText(row: DashboardViewModel['rows'][number]): string {
  if (row.kind === 'workspace') {
    return workspaceText(row)
  }
  if (row.kind === 'agent') {
    return agentText(row)
  }
  return `   ${row.label}`
}

function visibleRows(view: DashboardViewModel, capacity: number): DashboardViewModel['rows'] {
  if (capacity <= 0 || view.rows.length <= capacity) {
    return view.rows.slice(0, Math.max(0, capacity))
  }
  const selectedIndex = view.rows.findIndex((row) => row.kind === 'workspace' && row.selected)
  const focus = Math.max(0, selectedIndex)
  const start = Math.min(Math.max(0, focus - Math.floor(capacity / 2)), view.rows.length - capacity)
  return view.rows.slice(start, start + capacity)
}

export function renderAnsiDashboardFrame(view: DashboardViewModel, viewport: Viewport): string {
  const width = Math.max(1, viewport.width)
  const height = Math.max(1, viewport.height)
  const foreground = ORCA_DARK.foreground
  const muted = ORCA_DARK.mutedForeground
  const headerRight = `runtime · ${view.header.runtime}`
  const headerGap = Math.max(1, width - view.header.product.length - headerRight.length - 2)
  const header = ` ${view.header.product}${' '.repeat(headerGap)}${headerRight} `

  if (height === 1) {
    return paint(header, width, foreground, ORCA_DARK.sidebar)
  }

  const contentCapacity = Math.max(0, height - 4)
  const rows = visibleRows(view, contentCapacity)
  const lines = [paint(header, width, foreground, ORCA_DARK.sidebar)]
  lines.push(paint('', width, foreground, ORCA_DARK.background))

  for (const row of rows) {
    const selected = row.kind === 'workspace' && row.selected
    lines.push(paint(
      contentText(row),
      width,
      selected ? foreground : muted,
      selected ? ORCA_DARK.sidebarAccent : ORCA_DARK.background
    ))
  }
  while (lines.length < height - 2) {
    lines.push(paint('', width, foreground, ORCA_DARK.background))
  }
  lines.push(paint('', width, foreground, ORCA_DARK.background))
  lines.push(paint(` ${view.footer}`, width, muted, ORCA_DARK.sidebar))

  return lines.slice(0, height).join('\n')
}

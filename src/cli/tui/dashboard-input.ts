export type DashboardKey = {
  name?: string
  ctrl?: boolean
}

export type DashboardInputAction =
  | { type: 'move-selection'; delta: number }
  | { type: 'refresh' }
  | { type: 'exit' }

export function mapDashboardKey(
  sequence: string | undefined,
  key: DashboardKey | undefined
): DashboardInputAction | null {
  const name = key?.name?.toLowerCase()
  if (key?.ctrl === true && name === 'c') {
    return { type: 'exit' }
  }
  if (name === 'down' || name === 'j' || sequence === 'j') {
    return { type: 'move-selection', delta: 1 }
  }
  if (name === 'up' || name === 'k' || sequence === 'k') {
    return { type: 'move-selection', delta: -1 }
  }
  if (name === 'r' || sequence === 'r') {
    return { type: 'refresh' }
  }
  if (name === 'q' || sequence === 'q') {
    return { type: 'exit' }
  }
  return null
}

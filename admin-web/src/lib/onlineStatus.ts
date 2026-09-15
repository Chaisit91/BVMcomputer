// "Online" isn't a real live signal (no websocket/heartbeat) — it's derived
// from lastActiveAt, which the backend refreshes on every authenticated
// request (throttled to once/minute). Someone idle on one page for longer
// than the window reads as offline even with the tab still open — ponytail:
// last-activity window, upgrade to a heartbeat ping if that gap matters.
const ONLINE_WINDOW_MS = 5 * 60 * 1000

export function isOnline(lastActiveAt: string | null | undefined): boolean {
  if (!lastActiveAt) return false
  const date = new Date(lastActiveAt)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() < ONLINE_WINDOW_MS
}

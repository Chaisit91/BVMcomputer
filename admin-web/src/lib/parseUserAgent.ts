// Edge's UA string contains "Chrome/" and "Safari/" too (it's Chromium-based),
// and Chrome's contains "Safari/" — order matters: most-specific check first.
// Parsed at display time (not stored) so existing raw-UA history rows read
// nicely too, without needing to backfill the database.
export function parseUserAgent(ua: string | undefined): string {
  if (!ua) return 'ไม่ทราบอุปกรณ์'

  let browser = 'อื่นๆ'
  if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('OPR/')) browser = 'Opera'
  else if (ua.includes('Chrome/')) browser = 'Chrome'
  else if (ua.includes('Firefox/')) browser = 'Firefox'
  else if (ua.includes('Safari/')) browser = 'Safari'

  let os = 'อื่นๆ'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS X')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  return `${browser}, ${os}`
}

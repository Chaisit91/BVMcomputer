import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { canAccess } from '../lib/permissions'
import { getUnreadAnnouncementCount } from '../services/announcement.service'
import { getUnreadChatSummary } from '../services/chat.service'
import { useAppSelector } from '../store/hooks'

// Not true push — just a tight enough poll that it feels near-instant without
// standing up a WebSocket/SSE server for a small internal team.
const NOTIFICATION_POLL_INTERVAL_MS = 5_000

// Shared by Topbar (super_admin) and Sidebar (every other role) — both show
// the same two badges, so the polling lives in one place instead of twice.
export function useNotificationBadges() {
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

  const showChatBadge = canAccess(user?.role, '/manage/chats')
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  // When exactly one conversation is unread, the bell jumps straight to it
  // instead of the list — with several open, there's no single "the" one to jump to.
  const [soleUnreadConversationId, setSoleUnreadConversationId] = useState<string | null>(null)
  const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0)

  useEffect(() => {
    if (!showChatBadge) return

    let cancelled = false
    const poll = () => {
      getUnreadChatSummary()
        .then((summary) => {
          if (cancelled) return
          setUnreadChatCount(summary.total)
          setSoleUnreadConversationId(summary.soleConversationId)
        })
        .catch(() => {})
    }
    poll()
    const interval = setInterval(poll, NOTIFICATION_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // Re-poll immediately on every navigation too — otherwise reading a chat
    // then leaving the page leaves the badge stale until the next poll tick.
  }, [showChatBadge, location.pathname])

  useEffect(() => {
    if (!user) return

    let cancelled = false
    const poll = () => {
      getUnreadAnnouncementCount()
        .then((count) => {
          if (!cancelled) setUnreadAnnouncementCount(count)
        })
        .catch(() => {})
    }
    poll()
    const interval = setInterval(poll, NOTIFICATION_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // Re-poll immediately on every navigation too — otherwise reading
    // announcements then leaving the page leaves the badge stale until the
    // next poll tick.
  }, [user, location.pathname])

  return { showChatBadge, unreadChatCount, soleUnreadConversationId, unreadAnnouncementCount }
}

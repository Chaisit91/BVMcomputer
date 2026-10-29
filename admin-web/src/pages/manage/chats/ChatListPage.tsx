import { useEffect, useMemo, useState } from 'react'
import { FiMessageCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Avatar } from '../../../components/ui/Avatar'
import { formatDateTime } from '../../../lib/formatDate'
import { matchesSearchText } from '../../../lib/textSearch'
import { getConversations } from '../../../services/chat.service'
import type { ChatConversation } from '../../../types/chat'

type LoadStatus = 'loading' | 'error' | 'success'
type FilterTab = 'all' | 'unread'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ChatListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')

  useEffect(() => {
    let cancelled = false

    getConversations()
      .then((result) => {
        if (!cancelled) {
          setConversations(result)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const tabCounts = useMemo(
    () => ({ all: conversations.length, unread: conversations.filter((c) => c.unreadCount > 0).length }),
    [conversations],
  )

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'unread', label: 'ยังไม่ตอบ' },
  ]

  const visibleConversations = useMemo(
    () =>
      conversations
        .filter((c) => tab !== 'unread' || c.unreadCount > 0)
        .filter((c) => matchesSearchText(search, c.customerName, c.customerCode, c.lastMessagePreview)),
    [conversations, search, tab],
  )

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-6">
      <h1 className="text-xl font-bold text-gray-900">แชทลูกค้า</h1>

      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="ค้นหาลูกค้า หรือข้อความ..."
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              tab === option.value ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
            <span
              className={`rounded-full px-1.5 text-xs ${
                tab === option.value ? 'bg-white/20' : 'bg-white text-gray-400'
              }`}
            >
              {tabCounts[option.value]}
            </span>
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-50 overflow-hidden card">
        {visibleConversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-gray-400">
            <FiMessageCircle size={28} className="text-gray-300" />
            {tab === 'all' ? 'ยังไม่มีการสนทนากับลูกค้า' : 'ไม่มีแชทในหมวดนี้'}
          </div>
        ) : (
          visibleConversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/manage/chats/${conversation.id}`}
              className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50"
            >
              <Avatar initials={getInitials(conversation.customerName)} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {conversation.customerName}
                  </p>
                  <span className="shrink-0 text-xs text-gray-400">{formatDateTime(conversation.lastMessageAt)}</span>
                </div>
                <p className={`truncate text-sm ${conversation.unreadCount > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  {conversation.lastMessagePreview || 'ยังไม่มีข้อความ'}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </main>
  )
}

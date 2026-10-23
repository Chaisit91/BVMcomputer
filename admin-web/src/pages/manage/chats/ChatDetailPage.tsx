import { useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiSend } from 'react-icons/fi'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { formatDateTime } from '../../../lib/formatDate'
import { getCustomerDetail } from '../../../services/customer.service'
import { getConversation, getMessages, markConversationRead, sendMessage } from '../../../services/chat.service'
import type { Customer } from '../../../types/customer'
import type { ChatConversation, ChatMessage } from '../../../types/chat'
import { orderStatusMeta } from '../../../types/order'

type LoadStatus = 'loading' | 'error' | 'success'

// Polling, not a websocket — good enough for a small internal team, and the
// backend has no push transport to hang one off of yet.
const POLL_INTERVAL_MS = 5000

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ChatDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const threadEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conversationId) return
    let cancelled = false

    Promise.all([getConversation(conversationId), getMessages(conversationId)])
      .then(([conversationResult, messagesResult]) => {
        if (cancelled) return
        setConversation(conversationResult)
        setMessages(messagesResult)
        setStatus('success')
        markConversationRead(conversationId).catch(() => {})
        getCustomerDetail(conversationResult.customerId).then((result) => {
          if (!cancelled) setCustomer(result)
        })
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [conversationId])

  useEffect(() => {
    if (!conversationId || status !== 'success') return
    const interval = setInterval(() => {
      getMessages(conversationId).then(setMessages).catch(() => {})
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [conversationId, status])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || !conversationId || sending) return
    setSending(true)
    try {
      const message = await sendMessage(conversationId, content)
      setMessages((prev) => [...prev, message])
      setDraft('')
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
  }

  if (status === 'error' || !conversation) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit space-y-4 rounded-2xl border border-gray-100 bg-white p-5">
        <Link to="/manage/chats" className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600">
          <FiArrowLeft size={14} />
          กลับไปหน้ารายการแชท
        </Link>
        <div className="flex flex-col items-center gap-2 text-center">
          <Avatar initials={getInitials(conversation.customerName)} size={56} />
          <p className="text-sm font-semibold text-gray-900">{conversation.customerName}</p>
          <p className="text-xs text-gray-400">{conversation.customerCode}</p>
        </div>
        {customer && (
          <div className="space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <p className="truncate">{customer.email}</p>
            <p>{customer.phone}</p>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">ประวัติคำสั่งซื้อ</p>
          {!customer || customer.recentOrders.length === 0 ? (
            <p className="text-xs text-gray-400">ยังไม่มีคำสั่งซื้อ</p>
          ) : (
            <ul className="space-y-2">
              {customer.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-gray-600">{order.orderCode}</span>
                  <Badge variant={orderStatusMeta[order.status].variant}>{orderStatusMeta[order.status].label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-gray-100 bg-white">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">ยังไม่มีข้อความในแชทนี้</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                {message.sender === 'admin' && message.senderAdminName && (
                  <span className="mb-0.5 px-1 text-[10px] font-medium text-gray-400">{message.senderAdminName}</span>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.sender === 'admin' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`mt-1 text-[10px] ${message.sender === 'admin' ? 'text-rose-100' : 'text-gray-400'}`}>
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={threadEndRef} />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSend()
          }}
          className="flex items-center gap-3 border-t border-gray-100 p-4"
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="พิมพ์ข้อความตอบลูกค้า..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="ส่งข้อความ"
          >
            <FiSend size={16} />
          </button>
        </form>
      </section>
    </main>
  )
}

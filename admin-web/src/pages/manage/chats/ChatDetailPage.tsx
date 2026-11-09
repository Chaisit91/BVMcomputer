import { useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiFile, FiPaperclip, FiSend, FiX } from 'react-icons/fi'
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ACCEPTED_ATTACHMENT_TYPES = 'image/jpeg,image/png,image/webp,image/gif,application/pdf'

// Split (global flag, used only by .split) vs. test (no flag — a stateful
// lastIndex on a shared global regex would otherwise give wrong alternating
// results across calls) need separate regex objects.
const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g
const URL_TEST_REGEX = /^https?:\/\//

// Splits message text around any http(s) URL and turns each one into a real
// clickable link, instead of showing the raw text.
function linkifyContent(content: string) {
  return content.split(URL_SPLIT_REGEX).map((part, index) =>
    URL_TEST_REGEX.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noreferrer" className="break-all underline">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

export function ChatDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if ((!content && pendingFiles.length === 0) || !conversationId || sending) return
    setSending(true)
    try {
      const message = await sendMessage(conversationId, content, pendingFiles)
      setMessages((prev) => [...prev, message])
      setDraft('')
      setPendingFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
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
      <aside className="h-fit space-y-4 card p-5">
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

      <section className="flex h-[calc(100vh-8rem)] flex-col card">
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
                  {message.content && (
                    <p className="whitespace-pre-wrap break-words">{linkifyContent(message.content)}</p>
                  )}
                  {message.attachments.length > 0 && (
                    <div className={`space-y-1.5 ${message.content ? 'mt-2' : ''}`}>
                      {message.attachments.map((attachment) =>
                        attachment.contentType.startsWith('image/') ? (
                          <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="block">
                            <img
                              src={attachment.url}
                              alt={attachment.fileName}
                              className="max-h-48 rounded-lg border border-black/5 object-cover"
                            />
                          </a>
                        ) : (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                              message.sender === 'admin'
                                ? 'border-white/30 text-white hover:bg-white/10'
                                : 'border-gray-200 text-gray-600 hover:border-rose-200 hover:text-rose-500'
                            }`}
                          >
                            <FiFile size={14} className="shrink-0" />
                            <span className="truncate">{attachment.fileName}</span>
                            <span className="shrink-0 opacity-70">({formatFileSize(attachment.fileSizeBytes)})</span>
                          </a>
                        ),
                      )}
                    </div>
                  )}
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
          className="border-t border-gray-100 p-4"
        >
          {pendingFiles.length > 0 && (
            <ul className="mb-2 space-y-1">
              {pendingFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                  <span className="truncate">
                    {file.name} <span className="text-gray-400">({formatFileSize(file.size)})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
                    className="shrink-0 text-gray-400 hover:text-rose-500"
                    aria-label="เอาไฟล์นี้ออก"
                  >
                    <FiX size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_ATTACHMENT_TYPES}
              onChange={(event) => setPendingFiles(Array.from(event.target.files ?? []))}
              className="hidden"
              id="chat-attachment-input"
            />
            <label
              htmlFor="chat-attachment-input"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-rose-500"
              aria-label="แนบไฟล์"
            >
              <FiPaperclip size={18} />
            </label>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="พิมพ์ข้อความตอบลูกค้า..."
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <button
              type="submit"
              disabled={(!draft.trim() && pendingFiles.length === 0) || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="ส่งข้อความ"
            >
              <FiSend size={16} />
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

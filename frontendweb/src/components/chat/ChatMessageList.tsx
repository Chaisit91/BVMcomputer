import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { FiAlertCircle, FiArrowDown, FiCheck, FiClipboard, FiRefreshCw } from 'react-icons/fi';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../lib/cn';
import type { LocalChatMessage } from '../../features/chat/chatSlice';

// Fixed greeting shown in the UI — not a message from the backend, and not an admin reply.
const WELCOME_TEXT = 'สวัสดีครับ ยินดีให้คำปรึกษาเรื่องอัปเกรดคอมพิวเตอร์ ต้องการสอบถามเรื่องอะไรครับ?';

/** How close to the bottom (px) still counts as "reading the latest" — new messages then auto-scroll. */
const STICKY_THRESHOLD = 80;

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

function formatDay(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'วันนี้';
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ChatMessageListProps {
  messages: LocalChatMessage[];
  onRetry: (clientId: string) => void;
  /** Changes every time the panel opens, so it can jump to the latest message. */
  openKey: number;
}

export function ChatMessageList({ messages, onRetry, openKey }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastCount = useRef(messages.length);
  const [hasNewBelow, setHasNewBelow] = useState(false);

  const jumpToBottom = (behavior: ScrollBehavior) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
    stickToBottom.current = true;
  };

  const scrollToBottom = (behavior: ScrollBehavior) => {
    jumpToBottom(behavior);
    setHasNewBelow(false);
  };

  // Opening the panel always shows the latest message.
  useLayoutEffect(() => {
    jumpToBottom('auto');
  }, [openKey]);

  // New message: follow it if the reader is already at the bottom or it's their own message;
  // otherwise leave their reading position alone and offer a "new message" jump button instead.
  useEffect(() => {
    if (messages.length <= lastCount.current) {
      lastCount.current = messages.length;
      return;
    }
    lastCount.current = messages.length;
    const latest = messages[messages.length - 1];
    if (stickToBottom.current || latest.sender === 'customer') {
      scrollToBottom('smooth');
    } else {
      setHasNewBelow(true);
    }
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICKY_THRESHOLD;
    if (stickToBottom.current) setHasNewBelow(false);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="ข้อความสนทนา"
        className="h-full overflow-y-auto overscroll-contain px-4 py-4"
      >
        <AdminBubble>
          <p>{WELCOME_TEXT}</p>
          <p className="mt-1 text-[11px] text-slate-400">ข้อความต้อนรับอัตโนมัติ</p>
        </AdminBubble>

        {messages.map((message, index) => {
          const showDay = index === 0 || formatDay(messages[index - 1].createdAt) !== formatDay(message.createdAt);
          return (
            <div key={message.clientId}>
              {showDay && (
                <p className="my-3 text-center text-xs font-medium text-slate-400">{formatDay(message.createdAt)}</p>
              )}
              {message.sender === 'admin' ? (
                <AdminBubble time={formatTime(message.createdAt)}>
                  <MessageBody message={message} />
                </AdminBubble>
              ) : (
                <CustomerBubble message={message} onRetry={() => onRetry(message.clientId)} />
              )}
            </div>
          );
        })}
      </div>

      {hasNewBelow && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white shadow-card"
        >
          <FiArrowDown size={12} aria-hidden="true" />
          ข้อความใหม่
        </button>
      )}
    </div>
  );
}

function AdminBubble({ time, children }: { time?: string; children: ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-extrabold text-white" aria-hidden="true">
        M
      </span>
      <div className="min-w-0 max-w-[80%]">
        <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-md bg-slate-100 px-3.5 py-2.5 text-sm leading-relaxed text-ink [overflow-wrap:anywhere]">
          {children}
        </div>
        {time && <p className="mt-1 text-[11px] text-slate-400">{time}</p>}
      </div>
    </div>
  );
}

function CustomerBubble({ message, onRetry }: { message: LocalChatMessage; onRetry: () => void }) {
  const failed = message.delivery === 'failed';
  return (
    <div className="mb-3 flex flex-col items-end">
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md px-3.5 py-2.5 text-sm leading-relaxed text-ink [overflow-wrap:anywhere]',
          failed ? 'border border-red-200 bg-red-50' : 'bg-red-50',
          message.delivery === 'sending' && 'opacity-70',
        )}
      >
        <MessageBody message={message} />
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
        {message.delivery === 'sending' && (
          <>
            <Spinner size={11} />
            กำลังส่ง...
          </>
        )}
        {message.delivery === 'sent' && (
          <>
            {formatTime(message.createdAt)}
            <FiCheck size={12} className="text-sky-500" aria-label="ส่งแล้ว" />
          </>
        )}
        {message.delivery === 'demo' && <>{formatTime(message.createdAt)} · Demo — ยังไม่ได้ส่งถึงแอดมิน</>}
        {failed && (
          <span className="flex items-center gap-1 text-red-500">
            <FiAlertCircle size={12} aria-hidden="true" />
            {message.error ?? 'ส่งไม่สำเร็จ'}
            <button
              type="button"
              onClick={onRetry}
              className="ml-1 inline-flex items-center gap-0.5 font-semibold text-brand underline-offset-2 hover:underline"
            >
              <FiRefreshCw size={11} aria-hidden="true" />
              ลองอีกครั้ง
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

function MessageBody({ message }: { message: LocalChatMessage }) {
  if (!message.spec) return <>{message.text}</>;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-1.5 font-semibold">
        <FiClipboard size={14} className="shrink-0 text-brand" aria-hidden="true" />
        ข้อมูลสเปคคอมของฉัน
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
        {message.spec.map((item) => (
          <div key={item.field} className="contents">
            <dt className="text-slate-500">{item.label}</dt>
            <dd className="font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

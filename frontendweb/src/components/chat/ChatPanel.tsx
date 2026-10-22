import { forwardRef, type CSSProperties } from 'react';
import { FiAlertTriangle, FiClipboard, FiMinus, FiRefreshCw, FiX } from 'react-icons/fi';
import { ChatMessageList } from './ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { SpecShareDialog } from './SpecShareDialog';
import { cn } from '../../lib/cn';
import type { LocalChatMessage } from '../../features/chat/chatSlice';
import type { SpecShareOption } from '../../data/chatSpecShare';
import type { RequestStatus } from '../../types/api';
import type { ChatMode, SharedSpecItem, SupportStatus } from '../../types/chat';

interface ChatPanelProps {
  visible: boolean;
  /** Mobile only: the visual viewport box, so the input stays above the on-screen keyboard. */
  viewportStyle?: CSSProperties;
  connectStatus: RequestStatus;
  connectError: string | null;
  mode: ChatMode | null;
  supportStatus: SupportStatus | null;
  messages: LocalChatMessage[];
  openKey: number;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (text: string) => void;
  onRetryMessage: (clientId: string) => void;
  onReconnect: () => void;
  onMinimize: () => void;
  onClose: () => void;
  shareOptions: SpecShareOption[];
  isShareOpen: boolean;
  onOpenShare: () => void;
  onCancelShare: () => void;
  onConfirmShare: (items: SharedSpecItem[]) => void;
}

/** Status line under the title — always the real state; never "online" unless the backend says so. */
function StatusBadge({ connectStatus, mode, supportStatus }: Pick<ChatPanelProps, 'connectStatus' | 'mode' | 'supportStatus'>) {
  let dot = 'bg-white/50';
  let label = 'กำลังเชื่อมต่อ...';
  if (connectStatus === 'failed') {
    dot = 'bg-amber-300';
    label = 'เชื่อมต่อไม่ได้';
  } else if (mode === 'demo') {
    dot = 'bg-amber-300';
    label = 'โหมดทดสอบ (Demo)';
  } else if (mode === 'live' && supportStatus) {
    const online = supportStatus.availability === 'online';
    dot = online ? 'bg-emerald-400' : 'bg-white/50';
    label = online ? 'ออนไลน์' : 'ออฟไลน์ · ฝากข้อความไว้ได้';
    if (supportStatus.replyTimeMinutes) label += ` · ตอบกลับประมาณ ${supportStatus.replyTimeMinutes} นาที`;
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-white/90">
      <span className={cn('h-2 w-2 shrink-0 rounded-full', dot)} aria-hidden="true" />
      {label}
    </span>
  );
}

export const ChatPanel = forwardRef<HTMLTextAreaElement, ChatPanelProps>(
  (
    {
      visible,
      viewportStyle,
      connectStatus,
      connectError,
      mode,
      supportStatus,
      messages,
      openKey,
      draft,
      onDraftChange,
      onSend,
      onRetryMessage,
      onReconnect,
      onMinimize,
      onClose,
      shareOptions,
      isShareOpen,
      onOpenShare,
      onCancelShare,
      onConfirmShare,
    },
    composerRef,
  ) => {
    const isReady = connectStatus === 'succeeded';

    return (
      <div
        role="dialog"
        aria-modal="false"
        aria-label="แชทปรึกษาแอดมิน MAXCOM"
        style={viewportStyle}
        className={cn(
          // Phones: (almost) full screen. sm+: a floating window in the bottom-right corner, capped to the viewport.
          'fixed inset-x-0 top-0 z-40 flex h-[100dvh] flex-col overflow-hidden bg-white shadow-2xl',
          'sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-[min(620px,calc(100dvh-3rem))] sm:w-[380px] sm:rounded-2xl sm:border sm:border-slate-100',
          'origin-bottom-right transition-all duration-200 ease-out motion-reduce:transition-none',
          visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0',
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 bg-brand px-4 py-3 text-white">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-brand" aria-hidden="true">
            M
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">MAXCOM Support</p>
            <p className="truncate text-xs text-white/85">สอบถามเรื่องอัปเกรดคอมพิวเตอร์</p>
            <StatusBadge connectStatus={connectStatus} mode={mode} supportStatus={supportStatus} />
          </div>
          <button
            type="button"
            onClick={onMinimize}
            aria-label="ย่อหน้าต่างแชท"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
          >
            <FiMinus size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดแชท"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
          >
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Connection notices */}
        {mode === 'demo' && (
          <p className="shrink-0 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs leading-snug text-amber-700">
            โหมดทดสอบ: ระบบแชทยังไม่ได้เชื่อมต่อกับแอดมิน ข้อความจะแสดงในเครื่องนี้เท่านั้นและจะยังไม่มีการตอบกลับ
          </p>
        )}
        {connectStatus === 'failed' && (
          <div className="flex shrink-0 items-start gap-2 border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
            <FiAlertTriangle size={14} className="mt-px shrink-0" aria-hidden="true" />
            <span className="flex-1">{connectError ?? 'เชื่อมต่อระบบแชทไม่สำเร็จ'}</span>
            <button type="button" onClick={onReconnect} className="flex items-center gap-1 font-semibold text-brand hover:underline">
              <FiRefreshCw size={12} aria-hidden="true" />
              ลองใหม่
            </button>
          </div>
        )}

        <ChatMessageList messages={messages} onRetry={onRetryMessage} openKey={openKey} />

        {/* Share-my-spec card */}
        <div className="shrink-0 px-3 pb-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-card">
            <FiClipboard size={20} className="shrink-0 text-ink" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink">ส่งข้อมูลสเปคที่กรอกให้แอดมิน</p>
              <p className="text-[11px] text-slate-400">ช่วยให้แอดมินแนะนำได้ตรงจุดขึ้น</p>
            </div>
            <button
              type="button"
              onClick={onOpenShare}
              disabled={!isReady}
              className="shrink-0 rounded-full border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            >
              ส่งข้อมูลให้แอดมิน
            </button>
          </div>
        </div>

        <ChatComposer ref={composerRef} value={draft} onChange={onDraftChange} onSend={onSend} disabled={!isReady} />

        {isShareOpen && (
          <SpecShareDialog
            options={shareOptions}
            isDemo={mode === 'demo'}
            onCancel={onCancelShare}
            onConfirm={onConfirmShare}
          />
        )}
      </div>
    );
  },
);
ChatPanel.displayName = 'ChatPanel';

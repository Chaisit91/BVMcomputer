import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  closeChat,
  connectChat,
  minimizeChat,
  openChat,
  pollChat,
  sendChatMessage,
  setChatDraft,
} from '../../features/chat/chatSlice';
import { buildSpecShareOptions } from '../../data/chatSpecShare';
import { usePresence } from '../../hooks/usePresence';
import { useMobileViewport } from '../../hooks/useMobileViewport';
import { ChatLauncherButton } from './ChatLauncherButton';
import { ChatPanel } from './ChatPanel';
import type { SharedSpecItem } from '../../types/chat';

// Polling stands in for push notifications until the backend offers WebSocket/SSE.
const POLL_OPEN_MS = 8_000;
const POLL_HIDDEN_MS = 30_000;

/**
 * "ปรึกษาแอดมิน" support chat: floating launcher + panel. Fully self-contained (all state in the
 * `chat` slice), so it can be dropped onto any page without touching that page's own state.
 */
export function SupportChat() {
  const dispatch = useAppDispatch();
  const chat = useAppSelector((state) => state.chat);
  const upgrade = useAppSelector((state) => state.upgrade);

  const isOpen = chat.view === 'open';
  const { mounted, visible } = usePresence(isOpen);
  const mobileViewport = useMobileViewport(mounted);
  const [openKey, setOpenKey] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const shareOptions = useMemo(() => buildSpecShareOptions(upgrade), [upgrade]);

  const handleOpen = () => {
    dispatch(openChat());
    setOpenKey((key) => key + 1);
    void dispatch(connectChat());
  };

  const handleHide = (mode: 'minimize' | 'close') => {
    setIsShareOpen(false);
    dispatch(mode === 'minimize' ? minimizeChat() : closeChat());
    // Hand focus back to the launcher so keyboard users aren't left on a vanished element.
    launcherRef.current?.focus({ preventScroll: true });
  };

  // Desktop: put the cursor in the input on open. Skipped on touch screens, where it would pop the keyboard up.
  useEffect(() => {
    if (visible && window.matchMedia('(pointer: fine)').matches) {
      composerRef.current?.focus({ preventScroll: true });
    }
  }, [visible]);

  // Esc closes the consent sheet first, then minimizes the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isShareOpen) setIsShareOpen(false);
      else handleHide('minimize');
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // handleHide only dispatches stable actions — re-binding on every render isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isShareOpen]);

  // Pick up admin replies — faster while the panel is open; slower in the background for the unread badge.
  useEffect(() => {
    if (chat.mode !== 'live') return;
    const timer = setInterval(() => void dispatch(pollChat()), isOpen ? POLL_OPEN_MS : POLL_HIDDEN_MS);
    return () => clearInterval(timer);
  }, [chat.mode, isOpen, dispatch]);

  const handleSend = (text: string) => {
    void dispatch(sendChatMessage({ body: { text } }));
    dispatch(setChatDraft(''));
  };

  const handleConfirmShare = (items: SharedSpecItem[]) => {
    void dispatch(sendChatMessage({ body: { spec: items } }));
    setIsShareOpen(false);
  };

  return (
    <>
      <ChatLauncherButton ref={launcherRef} unreadCount={chat.unreadCount} hidden={isOpen} onClick={handleOpen} />

      {mounted && (
        <ChatPanel
          ref={composerRef}
          visible={visible}
          viewportStyle={mobileViewport ? { top: mobileViewport.top, height: mobileViewport.height } : undefined}
          connectStatus={chat.connectStatus}
          connectError={chat.connectError}
          mode={chat.mode}
          supportStatus={chat.supportStatus}
          messages={chat.messages}
          openKey={openKey}
          draft={chat.draft}
          onDraftChange={(value) => dispatch(setChatDraft(value))}
          onSend={handleSend}
          onRetryMessage={(clientId) => void dispatch(sendChatMessage({ retryClientId: clientId }))}
          onReconnect={() => void dispatch(connectChat())}
          onMinimize={() => handleHide('minimize')}
          onClose={() => handleHide('close')}
          shareOptions={shareOptions}
          isShareOpen={isShareOpen}
          onOpenShare={() => setIsShareOpen(true)}
          onCancelShare={() => setIsShareOpen(false)}
          onConfirmShare={handleConfirmShare}
        />
      )}
    </>
  );
}

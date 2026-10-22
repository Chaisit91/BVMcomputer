import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '../../api/apiError';
import {
  connectSupportChat,
  fetchSupportMessages,
  fetchSupportStatus,
  sendSupportMessage,
} from '../../services/chat/chatService';
import type { RequestStatus } from '../../types/api';
import type { ChatMessage, ChatMode, ChatSession, SendChatMessageBody, SupportStatus } from '../../types/chat';

/**
 * - sending/failed: a customer message on its way to (or rejected by) the backend.
 * - sent: confirmed by the backend (all admin messages are "sent").
 * - demo: kept in this browser only — no backend connected, nobody will read it.
 */
export type ChatDelivery = 'sending' | 'sent' | 'failed' | 'demo';

export interface LocalChatMessage extends ChatMessage {
  /** Stable key for React and for retrying — survives the server assigning the real id. */
  clientId: string;
  delivery: ChatDelivery;
  error?: string;
}

/** Panel visibility. "Minimized" and "closed" both hide the panel; closing also discards the unsent draft. */
export type ChatView = 'open' | 'hidden';

interface ChatState {
  view: ChatView;
  mode: ChatMode | null;
  connectStatus: RequestStatus;
  connectError: string | null;
  supportStatus: SupportStatus | null;
  conversationId: string | null;
  messages: LocalChatMessage[];
  /** Admin messages that arrived while the panel was hidden — drives the launcher badge. */
  unreadCount: number;
  draft: string;
}

const initialState: ChatState = {
  view: 'hidden',
  mode: null,
  connectStatus: 'idle',
  connectError: null,
  supportStatus: null,
  conversationId: null,
  messages: [],
  unreadCount: 0,
  draft: '',
};

type ChatRootState = { chat: ChatState };

const fromServer = (message: ChatMessage): LocalChatMessage => ({ ...message, clientId: message.id, delivery: 'sent' });

/** Connect lazily — only once the customer actually opens the chat. */
export const connectChat = createAsyncThunk<ChatSession, void, { state: ChatRootState; rejectValue: string }>(
  'chat/connect',
  async (_, { rejectWithValue }) => {
    try {
      return await connectSupportChat();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { connectStatus } = getState().chat;
      return connectStatus !== 'loading' && connectStatus !== 'succeeded';
    },
  },
);

/** Send a new message (`body`) or retry a failed one (`retryClientId`). */
export const sendChatMessage = createAsyncThunk<
  ChatMessage | null,
  { body?: SendChatMessageBody; retryClientId?: string },
  { state: ChatRootState; rejectValue: string }
>('chat/send', async ({ body, retryClientId }, { getState, rejectWithValue }) => {
  const { mode, conversationId, messages } = getState().chat;
  // Demo: nothing leaves the browser, and no reply is fabricated.
  if (mode !== 'live' || !conversationId) return null;

  const retried = retryClientId ? messages.find((m) => m.clientId === retryClientId) : undefined;
  const payload: SendChatMessageBody | undefined =
    body ?? (retried?.spec ? { spec: retried.spec } : retried?.text ? { text: retried.text } : undefined);
  if (!payload) return rejectWithValue('ไม่พบข้อความที่จะส่ง');

  try {
    return await sendSupportMessage(conversationId, payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/** Pull admin replies (and refresh availability). Polling stands in for push until the backend offers it. */
export const pollChat = createAsyncThunk<
  { messages: ChatMessage[]; status: SupportStatus | null },
  void,
  { state: ChatRootState }
>(
  'chat/poll',
  async (_, { getState }) => {
    const { conversationId, messages } = getState().chat;
    const lastServerId = [...messages].reverse().find((m) => m.delivery === 'sent')?.id;
    const [newMessages, status] = await Promise.all([
      fetchSupportMessages(conversationId!, lastServerId),
      fetchSupportStatus().catch(() => null),
    ]);
    return { messages: newMessages, status };
  },
  { condition: (_, { getState }) => getState().chat.mode === 'live' && Boolean(getState().chat.conversationId) },
);

function mergeServerMessages(state: ChatState, incoming: ChatMessage[]) {
  const known = new Set(state.messages.map((m) => m.id));
  for (const message of incoming) {
    if (known.has(message.id)) continue;
    state.messages.push(fromServer(message));
    if (message.sender === 'admin' && state.view !== 'open') state.unreadCount += 1;
  }
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    openChat: (state) => {
      state.view = 'open';
      state.unreadCount = 0;
    },
    /** Hide the panel but keep the half-typed message. */
    minimizeChat: (state) => {
      state.view = 'hidden';
    },
    /** Hide the panel and discard the unsent draft. History is kept either way. */
    closeChat: (state) => {
      state.view = 'hidden';
      state.draft = '';
    },
    setChatDraft: (state, action: PayloadAction<string>) => {
      state.draft = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectChat.pending, (state) => {
        state.connectStatus = 'loading';
        state.connectError = null;
      })
      .addCase(connectChat.fulfilled, (state, action) => {
        state.connectStatus = 'succeeded';
        state.mode = action.payload.mode;
        state.supportStatus = action.payload.status;
        state.conversationId = action.payload.conversationId;
        mergeServerMessages(state, action.payload.messages);
      })
      .addCase(connectChat.rejected, (state, action) => {
        state.connectStatus = 'failed';
        state.connectError = action.payload ?? 'เชื่อมต่อระบบแชทไม่สำเร็จ';
      })
      .addCase(sendChatMessage.pending, (state, action) => {
        const { body, retryClientId } = action.meta.arg;
        if (retryClientId) {
          const message = state.messages.find((m) => m.clientId === retryClientId);
          if (message) {
            message.delivery = 'sending';
            message.error = undefined;
          }
          return;
        }
        if (!body) return;
        state.messages.push({
          id: action.meta.requestId,
          clientId: action.meta.requestId,
          sender: 'customer',
          createdAt: new Date().toISOString(),
          ...body,
          delivery: 'sending',
        });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const clientId = action.meta.arg.retryClientId ?? action.meta.requestId;
        const index = state.messages.findIndex((m) => m.clientId === clientId);
        if (index === -1) return;
        if (action.payload === null) {
          state.messages[index].delivery = 'demo';
          return;
        }
        // A poll may already have delivered the server copy — drop the duplicate.
        const duplicate = state.messages.findIndex((m, i) => i !== index && m.id === action.payload!.id);
        if (duplicate !== -1) state.messages.splice(duplicate, 1);
        const at = state.messages.findIndex((m) => m.clientId === clientId);
        state.messages[at] = { ...action.payload, clientId, delivery: 'sent' };
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        const clientId = action.meta.arg.retryClientId ?? action.meta.requestId;
        const message = state.messages.find((m) => m.clientId === clientId);
        if (message) {
          message.delivery = 'failed';
          message.error = action.payload ?? 'ส่งข้อความไม่สำเร็จ';
        }
      })
      .addCase(pollChat.fulfilled, (state, action) => {
        mergeServerMessages(state, action.payload.messages);
        if (action.payload.status) state.supportStatus = action.payload.status;
      });
  },
});

export const { openChat, minimizeChat, closeChat, setChatDraft } = chatSlice.actions;
export default chatSlice.reducer;

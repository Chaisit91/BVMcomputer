import { isAxiosError } from 'axios';

/**
 * One error shape for every failed request, so slices and components never
 * have to dig through axios internals. `isNetworkError` means the request
 * never got an HTTP response (backend down, CORS, offline, timeout).
 */
export class ApiError extends Error {
  readonly status: number | null;
  readonly isNetworkError: boolean;

  constructor(message: string, status: number | null, isNetworkError: boolean) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

const statusMessages: Record<number, string> = {
  400: 'ข้อมูลที่ส่งไม่ถูกต้อง',
  401: 'กรุณาเข้าสู่ระบบอีกครั้ง',
  403: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  404: 'ไม่พบข้อมูลที่ต้องการ',
  409: 'ข้อมูลซ้ำหรือขัดแย้งกับข้อมูลที่มีอยู่',
  422: 'ข้อมูลที่ส่งไม่ถูกต้อง',
  429: 'มีการเรียกใช้งานถี่เกินไป กรุณาลองใหม่ภายหลัง',
};

const NETWORK_MESSAGE = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
const TIMEOUT_MESSAGE = 'เซิร์ฟเวอร์ตอบสนองช้าเกินไป กรุณาลองใหม่อีกครั้ง';
const SERVER_MESSAGE = 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง';

/** Prefer the backend's own `message` field when it sends one. */
function messageFromBody(data: unknown): string | null {
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' && data.message) {
    return data.message;
  }
  return null;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    if (!error.response) {
      const message = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' ? TIMEOUT_MESSAGE : NETWORK_MESSAGE;
      return new ApiError(message, null, true);
    }
    const { status, data } = error.response;
    const message = messageFromBody(data) ?? statusMessages[status] ?? (status >= 500 ? SERVER_MESSAGE : NETWORK_MESSAGE);
    return new ApiError(message, status, false);
  }

  return new ApiError(error instanceof Error ? error.message : SERVER_MESSAGE, null, false);
}

/** Plain string for `rejectWithValue` — Redux state must stay serializable. */
export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}

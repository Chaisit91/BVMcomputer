import type { StepId } from '../../pages/BuildCategoryPage';

export interface PcPreviewPart {
  category: StepId;
  productId: string;
  name: string;
  brand?: string;
  specLine: string;
  image?: string;
}

export interface PcPreviewRequest {
  parts: PcPreviewPart[];
}

export interface PcPreviewResponse {
  /** 'pending' while a teammate's real AI image-generation backend isn't wired up yet. */
  status: 'pending' | 'ready' | 'error';
  /** Real generated photo URL, once the backend provides one — absent while status is 'pending'. */
  imageUrl?: string;
  message: string;
}

/**
 * TODO(backend): a teammate owns the real AI PC-render pipeline — it takes the selected
 * parts (see PcPreviewRequest) and generates a photo of the assembled build. This mock
 * keeps the request/response shape that service will use, so swapping the body of this
 * function for a real `fetch('/api/build/preview', ...)` call later is a one-line change —
 * no UI rewrite needed. The modal never generates the image itself; it only calls this and
 * renders whatever comes back, falling back to a placeholder while status is 'pending'.
 */
export async function generatePcPreview(request: PcPreviewRequest): Promise<PcPreviewResponse> {
  void request;
  // Simulated latency so the loading state is visible in the mock.
  await new Promise((resolve) => setTimeout(resolve, 1400));
  return {
    status: 'pending',
    message: 'ระบบ AI สร้างภาพ PC กำลังเตรียมเชื่อมต่อ — เร็วๆ นี้จะแสดงภาพจำลองจากชิ้นส่วนที่คุณเลือกที่นี่',
  };
}

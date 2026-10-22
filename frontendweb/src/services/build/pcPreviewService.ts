import { apiPost, mockDelay, withMockFallback } from '../../api/request';
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
 * POST /build/preview — a teammate owns the AI PC-render pipeline: it takes the selected
 * parts and generates a photo of the assembled build. The modal never generates the image
 * itself; it only calls this and renders whatever comes back, falling back to a placeholder
 * while status is 'pending' (which is what the mock always answers).
 */
export function generatePcPreview(request: PcPreviewRequest): Promise<PcPreviewResponse> {
  return withMockFallback(
    'POST /build/preview',
    () => apiPost<PcPreviewResponse>('/build/preview', request),
    async () => {
      await mockDelay(1400);
      return {
        status: 'pending',
        message: 'ระบบ AI สร้างภาพ PC กำลังเตรียมเชื่อมต่อ — เร็วๆ นี้จะแสดงภาพจำลองจากชิ้นส่วนที่คุณเลือกที่นี่',
      };
    },
  );
}

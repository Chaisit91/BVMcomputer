import { apiPost, mockDelay, withMockFallback } from '../../api/request';
import type { UpgradeComponentKey, UpgradeSelection } from '../../types/upgrade';

export interface AiAnalysisRequest {
  selected: UpgradeSelection;
  /** Parts the customer didn't know (left blank) — the backend must not assume a model for these. */
  unknownParts: UpgradeComponentKey[];
  budget: string;
  usage: string;
  games: string;
}

export interface AiAnalysisResponse {
  /** 'pending' while a teammate's real AI backend isn't wired up yet. */
  status: 'pending' | 'ready' | 'error';
  message: string;
}

/**
 * POST /upgrade/analyze — the AI analysis engine (owned by a teammate). The frontend
 * never decides compatibility or upgrade advice itself; it only calls this and renders
 * whatever comes back. The mock answers 'pending' until that backend is reachable.
 */
export function analyzeUpgradeSpec(request: AiAnalysisRequest): Promise<AiAnalysisResponse> {
  return withMockFallback(
    'POST /upgrade/analyze',
    () => apiPost<AiAnalysisResponse>('/upgrade/analyze', request),
    async () => {
      await mockDelay(900);
      return {
        status: 'pending',
        message: 'ระบบ AI กำลังเตรียมเชื่อมต่อ — เร็วๆ นี้จะวิเคราะห์สเปคของคุณและแนะนำการอัปเกรดที่นี่',
      };
    },
  );
}

import type { UpgradeSelection } from '../../types/upgrade';

export interface AiAnalysisRequest {
  selected: UpgradeSelection;
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
 * TODO(backend): a teammate is building the real AI analysis engine at
 * `POST /api/upgrade/analyze`. This mock keeps the same request/response shape
 * that endpoint will use, so swapping it in later is a one-line change here —
 * no UI rewrite needed. The frontend never decides compatibility or upgrade
 * advice itself; it only calls this and renders whatever comes back.
 */
export async function analyzeUpgradeSpec(request: AiAnalysisRequest): Promise<AiAnalysisResponse> {
  void request;
  // Simulated latency so the loading state is visible in the mock.
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    status: 'pending',
    message: 'ระบบ AI กำลังเตรียมเชื่อมต่อ — เร็วๆ นี้จะวิเคราะห์สเปคของคุณและแนะนำการอัปเกรดที่นี่',
  };
}

import { apiPost, withMockFallback } from '../../api/request';
import { mockAnalyzeUpgrade } from './mockUpgradeAnalysis';
import type { UpgradeAnalysisRequest, UpgradeAnalysisResult } from '../../types/upgrade';

/**
 * POST /upgrade/analyze — one call covers compatibility checks, score, insight and recommendations
 * for the build (current spec + chosen upgrades). The backend's AI engine (owned by a teammate)
 * should answer with `source: 'ai'`. When the backend can't be reached (API_MODE auto/mock), a
 * rule-based estimate runs in the browser instead and is marked `source: 'mock'`.
 */
export function analyzeUpgrade(request: UpgradeAnalysisRequest): Promise<UpgradeAnalysisResult> {
  return withMockFallback(
    'POST /upgrade/analyze',
    () => apiPost<UpgradeAnalysisResult>('/upgrade/analyze', request),
    () => mockAnalyzeUpgrade(request),
  );
}

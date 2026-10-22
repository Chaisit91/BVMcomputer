import { apiPost, withMockFallback } from '../../api/request';
import type { UpgradeProduct, UpgradeSelection } from '../../types/upgrade';

export interface RecommendationRequest {
  selected: UpgradeSelection;
  budget: string;
  usage: string;
}

export interface RecommendationResponse {
  items: UpgradeProduct[];
}

/**
 * POST /upgrade/recommend — real product recommendations come from the backend once
 * the AI analysis exists. Not called by the UI yet; the mock returns no items.
 */
export function getUpgradeRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
  return withMockFallback(
    'POST /upgrade/recommend',
    () => apiPost<RecommendationResponse>('/upgrade/recommend', request),
    () => ({ items: [] }),
  );
}

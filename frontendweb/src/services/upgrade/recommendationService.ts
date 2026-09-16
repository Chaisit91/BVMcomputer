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
 * TODO(backend): `POST /api/upgrade/recommend` — real product recommendations
 * come from the backend once the AI analysis exists. Not called by the UI yet
 * (step 3 isn't built); this stub just reserves the interface.
 */
export async function getUpgradeRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
  void request;
  return { items: [] };
}

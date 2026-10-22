import { apiPost, withMockFallback } from '../../api/request';
import type { UpgradeComponentKey, UpgradeSelection } from '../../types/upgrade';

export interface CompatibilityCheckRequest {
  selected: UpgradeSelection;
}

export interface CompatibilityIssue {
  components: UpgradeComponentKey[];
  message: string;
}

export interface CompatibilityCheckResponse {
  compatible: boolean;
  issues: CompatibilityIssue[];
}

/**
 * POST /upgrade/compatibility — the real compatibility engine (socket/RAM type/PSU
 * wattage/GPU length/case clearance, etc.) lives on the backend. Not called by the
 * UI yet (step 4 isn't built); the mock reports everything as compatible.
 */
export function checkCompatibility(request: CompatibilityCheckRequest): Promise<CompatibilityCheckResponse> {
  return withMockFallback(
    'POST /upgrade/compatibility',
    () => apiPost<CompatibilityCheckResponse>('/upgrade/compatibility', request),
    () => ({ compatible: true, issues: [] }),
  );
}

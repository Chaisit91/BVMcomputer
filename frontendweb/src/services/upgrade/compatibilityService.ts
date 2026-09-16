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
 * TODO(backend): `POST /api/upgrade/compatibility` — the real compatibility
 * engine (socket/RAM type/PSU wattage/GPU length/case clearance, etc.) lives on
 * the backend. Not called by the UI yet (step 4 isn't built); this stub only
 * exists so that page can call something with the right shape once it is.
 */
export async function checkCompatibility(request: CompatibilityCheckRequest): Promise<CompatibilityCheckResponse> {
  void request;
  return { compatible: true, issues: [] };
}

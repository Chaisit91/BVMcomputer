import { createSelector } from '@reduxjs/toolkit';
import type { UpgradeSelection } from '../../types/upgrade';

interface UpgradeSliceState {
  upgrade: { upgrades: UpgradeSelection; upgradeSelections: UpgradeSelection };
}

/**
 * The upgrade actually in effect per category on step 3: the step-3 choice if there is one,
 * otherwise the product picked in step 2. The sidebar, AI cards, product grid, totals and the
 * analysis all read this, so they can never disagree. Memoized for stable re-renders.
 */
export const selectEffectiveUpgrades = createSelector(
  [(state: UpgradeSliceState) => state.upgrade.upgrades, (state: UpgradeSliceState) => state.upgrade.upgradeSelections],
  (original, step3): UpgradeSelection => ({ ...original, ...step3 }),
);

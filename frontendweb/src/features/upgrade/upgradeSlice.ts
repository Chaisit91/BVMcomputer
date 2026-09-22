import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UpgradeComponentKey, UpgradeProduct, UpgradeSelection } from '../../types/upgrade';

interface UpgradeState {
  /** Step 1 — what the customer owns right now. */
  currentSpec: UpgradeSelection;
  budget: string;
  usage: string;
  games: string;
  /** Step 2 — the products they picked to replace those parts (max one per category). */
  upgrades: UpgradeSelection;
}

const initialState: UpgradeState = {
  currentSpec: {},
  budget: '',
  usage: '',
  games: '',
  upgrades: {},
};

const upgradeSlice = createSlice({
  name: 'upgrade',
  initialState,
  reducers: {
    /** Called when leaving step 1 — carries the form over to step 2 (and back again). */
    setCurrentSpec: (
      state,
      action: PayloadAction<{ currentSpec: UpgradeSelection; budget: string; usage: string; games: string }>,
    ) => {
      state.currentSpec = action.payload.currentSpec;
      state.budget = action.payload.budget;
      state.usage = action.payload.usage;
      state.games = action.payload.games;
    },
    /** Pick a product to replace that category's current part; picking it again un-picks it. */
    toggleUpgrade: (state, action: PayloadAction<{ key: UpgradeComponentKey; product: UpgradeProduct }>) => {
      const { key, product } = action.payload;
      if (state.upgrades[key]?.productId === product.productId) {
        delete state.upgrades[key];
      } else {
        state.upgrades[key] = product;
      }
    },
    removeUpgrade: (state, action: PayloadAction<UpgradeComponentKey>) => {
      delete state.upgrades[action.payload];
    },
    clearUpgrades: (state) => {
      state.upgrades = {};
    },
  },
});

export const { setCurrentSpec, toggleUpgrade, removeUpgrade, clearUpgrades } = upgradeSlice.actions;
export default upgradeSlice.reducer;

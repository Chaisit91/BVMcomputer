import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UpgradeComponentKey, UpgradeProduct, UpgradeSelection } from '../../types/upgrade';

interface UpgradeState {
  /** Step 1 — what the customer owns right now. Only parts they actually picked; nothing is guessed. */
  currentSpec: UpgradeSelection;
  /** Optional step-1 parts (PSU / Case / Cooler) the customer left blank — "unknown", not "none". */
  unknownParts: UpgradeComponentKey[];
  budget: string;
  usage: string;
  games: string;
  /** Step 2 — the products they picked to replace those parts (max one per category). */
  upgrades: UpgradeSelection;
}

const initialState: UpgradeState = {
  currentSpec: {},
  unknownParts: [],
  budget: '',
  usage: '',
  games: '',
  upgrades: {},
};

const upgradeSlice = createSlice({
  name: 'upgrade',
  initialState,
  reducers: {
    // Step-1 form edits go straight into the store (not page-local state), so what's typed survives
    // navigation and other features — e.g. the support chat's "send my spec" — can read it.
    setCurrentPart: (state, action: PayloadAction<{ key: UpgradeComponentKey; product: UpgradeProduct }>) => {
      state.currentSpec[action.payload.key] = action.payload.product;
    },
    clearCurrentPart: (state, action: PayloadAction<UpgradeComponentKey>) => {
      delete state.currentSpec[action.payload];
    },
    setUpgradeDetails: (state, action: PayloadAction<Partial<Pick<UpgradeState, 'budget' | 'usage' | 'games'>>>) => {
      Object.assign(state, action.payload);
    },
    /** Called when leaving step 1 (after validation) — finalises the spec for step 2 onwards. */
    setCurrentSpec: (
      state,
      action: PayloadAction<{
        currentSpec: UpgradeSelection;
        unknownParts: UpgradeComponentKey[];
        budget: string;
        usage: string;
        games: string;
      }>,
    ) => {
      state.currentSpec = action.payload.currentSpec;
      state.unknownParts = action.payload.unknownParts;
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

export const {
  setCurrentPart,
  clearCurrentPart,
  setUpgradeDetails,
  setCurrentSpec,
  toggleUpgrade,
  removeUpgrade,
  clearUpgrades,
} = upgradeSlice.actions;
export default upgradeSlice.reducer;

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
  /**
   * Step 2 — the products they picked to replace those parts (max one per category). These are the
   * customer's original selected products: step 3 never overwrites or removes them.
   */
  upgrades: UpgradeSelection;
  /**
   * Step 3 — upgrade choices made on the analysis page, per category, layered over `upgrades`.
   * What each category shows = upgradeSelections ?? upgrades ?? currentSpec (see selectEffectiveUpgrades),
   * so removing a step-3 choice brings the step-2 product straight back.
   */
  upgradeSelections: UpgradeSelection;
}

const initialState: UpgradeState = {
  currentSpec: {},
  unknownParts: [],
  budget: '',
  usage: '',
  games: '',
  upgrades: {},
  upgradeSelections: {},
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
    /**
     * Step 2: picking a product makes it the category's upgrade (replacing any earlier pick —
     * never two per category); picking the same product again removes it. Changing the step-2
     * pick also drops that category's step-3 choice, so the new step-2 choice is what shows.
     */
    toggleUpgrade: (state, action: PayloadAction<{ key: UpgradeComponentKey; product: UpgradeProduct }>) => {
      const { key, product } = action.payload;
      if (state.upgrades[key]?.productId === product.productId) {
        delete state.upgrades[key];
      } else {
        state.upgrades[key] = product;
      }
      delete state.upgradeSelections[key];
    },
    removeUpgrade: (state, action: PayloadAction<UpgradeComponentKey>) => {
      delete state.upgrades[action.payload];
      delete state.upgradeSelections[action.payload];
    },
    clearUpgrades: (state) => {
      state.upgrades = {};
      state.upgradeSelections = {};
    },
    /**
     * Step 3 — used by both the AI recommendation cards and the product grid. Picking a product
     * makes it the category's upgrade (replacing any earlier step-3 choice); picking that choice
     * again — or picking the step-2 product itself — removes the step-3 choice, so the step-2
     * product is shown and selected again. Never touches `upgrades` or `currentSpec`.
     */
    toggleUpgradeSelection: (state, action: PayloadAction<{ key: UpgradeComponentKey; product: UpgradeProduct }>) => {
      const { key, product } = action.payload;
      const isCurrentChoice = state.upgradeSelections[key]?.productId === product.productId;
      const isOriginal = state.upgrades[key]?.productId === product.productId;
      if (isCurrentChoice || isOriginal) {
        delete state.upgradeSelections[key];
      } else {
        state.upgradeSelections[key] = product;
      }
    },
  },
});

export const {
  setCurrentPart,
  clearCurrentPart,
  setUpgradeDetails,
  setCurrentSpec,
  toggleUpgrade,
  toggleUpgradeSelection,
  removeUpgrade,
  clearUpgrades,
} = upgradeSlice.actions;
export default upgradeSlice.reducer;

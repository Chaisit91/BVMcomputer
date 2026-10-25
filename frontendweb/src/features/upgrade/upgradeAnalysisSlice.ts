import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { analyzeUpgrade } from '../../services/upgrade/aiService';
import { selectEffectiveUpgrades } from './upgradeSelectors';
import { getErrorMessage } from '../../api/apiError';
import type { RequestStatus } from '../../types/api';
import type { UpgradeAnalysisResult, UpgradeComponentKey, UpgradeSelection } from '../../types/upgrade';

interface UpgradeAnalysisState {
  status: RequestStatus;
  error: string | null;
  result: UpgradeAnalysisResult | null;
  /** Fingerprint of the build `result` was computed for — see selectIsAnalysisStale. */
  analyzedSignature: string | null;
}

const initialState: UpgradeAnalysisState = {
  status: 'idle',
  error: null,
  result: null,
  analyzedSignature: null,
};

interface UpgradeSlices {
  upgrade: {
    currentSpec: UpgradeSelection;
    upgrades: UpgradeSelection;
    upgradeSelections: UpgradeSelection;
    unknownParts: UpgradeComponentKey[];
    budget: string;
    usage: string;
    games: string;
  };
  upgradeAnalysis: UpgradeAnalysisState;
}

const ids = (selection: UpgradeSelection) =>
  Object.entries(selection)
    .map(([key, product]) => `${key}:${product?.productId ?? ''}`)
    .sort()
    .join(',');

/** Identifies the exact build (current parts + chosen upgrades). Any part change produces a new signature. */
export const buildSignature = (currentSpec: UpgradeSelection, upgrades: UpgradeSelection) =>
  `${ids(currentSpec)}|${ids(upgrades)}`;

export const runUpgradeAnalysis = createAsyncThunk<
  { result: UpgradeAnalysisResult; signature: string },
  void,
  { state: UpgradeSlices; rejectValue: string }
>(
  'upgradeAnalysis/run',
  async (_, { getState, rejectWithValue }) => {
    const { currentSpec, unknownParts, budget, usage, games } = getState().upgrade;
    // Analyse the build as shown: step-3 choices over the step-2 products.
    const upgrades = selectEffectiveUpgrades(getState());
    // Captured before the request: if parts change while it's in flight, the result is
    // tagged with the *old* build and is correctly reported as stale when it lands.
    const signature = buildSignature(currentSpec, upgrades);
    try {
      const result = await analyzeUpgrade({ currentSpec, upgrades, unknownParts, budget, usage, games });
      return { result, signature };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  // Ignore repeat clicks while an analysis is running.
  { condition: (_, { getState }) => getState().upgradeAnalysis.status !== 'loading' },
);

const upgradeAnalysisSlice = createSlice({
  name: 'upgradeAnalysis',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runUpgradeAnalysis.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(runUpgradeAnalysis.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.result = action.payload.result;
        state.analyzedSignature = action.payload.signature;
      })
      .addCase(runUpgradeAnalysis.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'วิเคราะห์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
      });
  },
});

/** True when there's a result but it belongs to a different build than the one on screen now. */
export const selectIsAnalysisStale = (state: UpgradeSlices) =>
  state.upgradeAnalysis.result !== null &&
  state.upgradeAnalysis.analyzedSignature !== buildSignature(state.upgrade.currentSpec, selectEffectiveUpgrades(state));

export default upgradeAnalysisSlice.reducer;

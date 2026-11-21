import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCartRecommendations } from '../../api/recommendationApi';
import type { RequestStatus } from '../../types/api';
import type { CartRecommendationItem } from '../../types';

interface CartRecommendationState {
  items: CartRecommendationItem[];
  status: RequestStatus;
}

const initialState: CartRecommendationState = {
  items: [],
  status: 'idle',
};

interface CartRecommendationRootState {
  cartRecommendation: CartRecommendationState;
}

/** Loaded once per session; a failure just leaves the section hidden (it's optional upsell). */
export const fetchCartRecommendations = createAsyncThunk<
  CartRecommendationItem[],
  void,
  { state: CartRecommendationRootState }
>('cartRecommendation/fetch', () => getCartRecommendations(), {
  condition: (_, { getState }) => getState().cartRecommendation.status === 'idle',
});

const cartRecommendationSlice = createSlice({
  name: 'cartRecommendation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartRecommendations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCartRecommendations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCartRecommendations.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default cartRecommendationSlice.reducer;

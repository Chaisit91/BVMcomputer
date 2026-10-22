import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { searchProducts, type ProductSummary } from '../../api/productApi';
import { getErrorMessage } from '../../api/apiError';
import type { RequestStatus } from '../../types/api';

interface SearchState {
  query: string;
  results: ProductSummary[];
  status: RequestStatus;
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  status: 'idle',
  error: null,
};

export const runSearch = createAsyncThunk<ProductSummary[], string, { rejectValue: string }>(
  'search/run',
  async (query, { rejectWithValue }) => {
    try {
      return await searchProducts(query);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runSearch.pending, (state, action) => {
        state.query = action.meta.arg;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(runSearch.fulfilled, (state, action) => {
        // A newer search may have started while this one was in flight.
        if (state.query !== action.meta.arg) return;
        state.status = 'succeeded';
        state.results = action.payload;
      })
      .addCase(runSearch.rejected, (state, action) => {
        if (state.query !== action.meta.arg) return;
        state.status = 'failed';
        state.error = action.payload ?? 'ค้นหาไม่สำเร็จ';
      });
  },
});

export default searchSlice.reducer;

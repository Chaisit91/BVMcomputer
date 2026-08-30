import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCategories, getProducts, getPromoBanners } from '../../api/homeApi';
import type { Category, Product, PromoBanner } from '../../types';

interface HomeState {
  categories: Category[];
  products: Product[];
  promoBanners: PromoBanner[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: HomeState = {
  categories: [],
  products: [],
  promoBanners: [],
  status: 'idle',
};

// The three sections are independent of each other, so fetch them all in
// parallel with Promise.all instead of chaining sequential requests.
export const fetchHomeData = createAsyncThunk('home/fetchHomeData', async () => {
  const [categories, products, promoBanners] = await Promise.all([
    getCategories(),
    getProducts(),
    getPromoBanners(),
  ]);
  return { categories, products, promoBanners };
});

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload.categories;
        state.products = action.payload.products;
        state.promoBanners = action.payload.promoBanners;
      })
      .addCase(fetchHomeData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default homeSlice.reducer;

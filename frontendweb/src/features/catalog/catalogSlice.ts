import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCategoryProducts } from '../../api/productApi';
import { getErrorMessage } from '../../api/apiError';
import { productCategorySlugs, type CategoryProductMap, type ProductCategorySlug } from '../../data/catalog';
import type { RequestStatus } from '../../types/api';

export interface CategoryListState<T> {
  items: T[];
  status: RequestStatus;
  error: string | null;
}

export type CatalogState = { [K in ProductCategorySlug]: CategoryListState<CategoryProductMap[K]> };

const initialState = Object.fromEntries(
  productCategorySlugs.map((slug) => [slug, { items: [], status: 'idle', error: null }]),
) as unknown as CatalogState;

interface CatalogRootState {
  catalog: CatalogState;
}

/**
 * Load one category's product list. Lists are cached in the store: navigating
 * back to a category (or opening it from the PC builder) won't refetch unless
 * `force` is set — e.g. from a "retry" button after an error.
 */
export const fetchCategoryProducts = createAsyncThunk<
  { slug: ProductCategorySlug; items: CategoryProductMap[ProductCategorySlug][] },
  { slug: ProductCategorySlug; force?: boolean },
  { state: CatalogRootState; rejectValue: string }
>(
  'catalog/fetchCategoryProducts',
  async ({ slug }, { rejectWithValue }) => {
    try {
      const items = await getCategoryProducts(slug);
      return { slug, items };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: ({ slug, force }, { getState }) => {
      const { status } = getState().catalog[slug];
      if (status === 'loading') return false;
      return force || status !== 'succeeded';
    },
  },
);

/**
 * Load several categories at once (the PC builder needs 8). Requests run in
 * parallel with Promise.all — each one still goes through fetchCategoryProducts,
 * so already-cached categories are skipped and every list keeps its own status.
 */
export const fetchCategoriesProducts = createAsyncThunk<
  void,
  { slugs: ProductCategorySlug[]; force?: boolean },
  { state: CatalogRootState }
>(
  'catalog/fetchCategoriesProducts',
  async ({ slugs, force }, { dispatch }) => {
    await Promise.all(slugs.map((slug) => dispatch(fetchCategoryProducts({ slug, force }))));
  },
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryProducts.pending, (state, action) => {
        const list = state[action.meta.arg.slug];
        list.status = 'loading';
        list.error = null;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        // The payload's items always belong to its own slug — TS just can't correlate the two.
        const list = state[action.payload.slug] as CategoryListState<unknown>;
        list.status = 'succeeded';
        list.items = action.payload.items;
      })
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        const list = state[action.meta.arg.slug];
        list.status = 'failed';
        list.error = action.payload ?? 'โหลดข้อมูลสินค้าไม่สำเร็จ';
      });
  },
});

export default catalogSlice.reducer;

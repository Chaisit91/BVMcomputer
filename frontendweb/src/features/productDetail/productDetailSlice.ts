import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCategoryProduct, getCategoryProducts } from '../../api/productApi';
import { getErrorMessage } from '../../api/apiError';
import { isProductCategorySlug } from '../../data/catalog';
import { buildProductDetail, type ProductDetailData } from '../../data/productLookup';
import type { RequestStatus } from '../../types/api';
import type { CatalogState } from '../catalog/catalogSlice';

interface ProductDetailState {
  /** null after a successful load means "no such product" (404). */
  product: ProductDetailData | null;
  status: RequestStatus;
  error: string | null;
  /** "{category}/{id}" of the latest request — lets the page tell a stale product from the one it asked for. */
  key: string | null;
  /** Ignore responses from a previous product if the user navigated on quickly. */
  currentRequestId: string | null;
}

const initialState: ProductDetailState = {
  product: null,
  status: 'idle',
  error: null,
  key: null,
  currentRequestId: null,
};

export const productDetailKey = (category: string, id: string) => `${category}/${id}`;

export const fetchProductDetail = createAsyncThunk<
  ProductDetailData | null,
  { category: string; id: string },
  { state: { catalog: CatalogState }; rejectValue: string }
>('productDetail/fetch', async ({ category, id }, { getState, rejectWithValue }) => {
  if (!isProductCategorySlug(category)) return null;

  try {
    // The product and its category list (for "related products") are independent,
    // so fetch both in parallel — reusing the list from the store when it's already loaded.
    const cachedList = getState().catalog[category];
    const [product, catalog] = await Promise.all([
      getCategoryProduct(category, id),
      cachedList.status === 'succeeded' ? cachedList.items : getCategoryProducts(category),
    ]);
    return product ? buildProductDetail(category, product, catalog) : null;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const productDetailSlice = createSlice({
  name: 'productDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetail.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.key = productDetailKey(action.meta.arg.category, action.meta.arg.id);
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = 'succeeded';
        state.product = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = 'failed';
        state.error = action.payload ?? 'โหลดข้อมูลสินค้าไม่สำเร็จ';
      });
  },
});

export default productDetailSlice.reducer;

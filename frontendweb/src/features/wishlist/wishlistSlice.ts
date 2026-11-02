import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as wishlistApi from '../../api/wishlistApi';
import { getErrorMessage } from '../../api/apiError';
import { loginUser, logoutUser, sessionExpired } from '../auth/authSlice';
import type { ProductCategorySlug } from '../../data/catalog';
import type { AccountDataSource, RequestStatus, WishlistEntry } from '../../types/api';

interface WishlistState {
  entries: WishlistEntry[];
  status: RequestStatus;
  error: string | null;
  /** 'demo' = kept in this browser only, not synced to the account. */
  source: AccountDataSource | null;
  /** Last add/remove that the server refused — the optimistic change has already been undone. */
  mutationError: string | null;
}

const initialState: WishlistState = {
  entries: [],
  status: 'idle',
  error: null,
  source: null,
  mutationError: null,
};

type WishlistRootState = { wishlist: WishlistState };

interface WishlistItemRef {
  category: ProductCategorySlug;
  productId: string;
}

const sameItem = (a: WishlistItemRef, b: WishlistItemRef) => a.category === b.category && a.productId === b.productId;

export const fetchWishlist = createAsyncThunk<
  wishlistApi.WishlistResult<WishlistEntry[]>,
  { force?: boolean } | undefined,
  { state: WishlistRootState; rejectValue: string }
>(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistApi.getWishlist();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    // Every heart button asks for the list — only the first request (or a retry) goes out.
    condition: (arg, { getState }) => {
      const { status } = getState().wishlist;
      if (status === 'loading') return false;
      return Boolean(arg?.force) || status === 'idle';
    },
  },
);

/** Optimistic: the heart fills immediately, and is undone if the server refuses. */
export const addToWishlist = createAsyncThunk<
  wishlistApi.WishlistResult<WishlistEntry>,
  WishlistItemRef,
  { rejectValue: string }
>('wishlist/add', async ({ category, productId }, { rejectWithValue }) => {
  try {
    return await wishlistApi.addWishlistItem(category, productId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/** Optimistic: takes the whole entry so it can be put back (same position in "ล่าสุด") on failure. */
export const removeFromWishlist = createAsyncThunk<wishlistApi.WishlistResult<null>, WishlistEntry, { rejectValue: string }>(
  'wishlist/remove',
  async ({ category, productId }, { rejectWithValue }) => {
    try {
      return await wishlistApi.removeWishlistItem(category, productId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entries = action.payload.data;
        state.source = action.payload.source;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'โหลดรายการสินค้าที่ถูกใจไม่สำเร็จ';
      })
      .addCase(addToWishlist.pending, (state, action) => {
        state.mutationError = null;
        if (!state.entries.some((entry) => sameItem(entry, action.meta.arg))) {
          state.entries.unshift({ ...action.meta.arg, addedAt: new Date().toISOString() });
        }
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const index = state.entries.findIndex((entry) => sameItem(entry, action.payload.data));
        if (index >= 0) state.entries[index] = action.payload.data;
        state.source = action.payload.source;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.entries = state.entries.filter((entry) => !sameItem(entry, action.meta.arg));
        state.mutationError = action.payload ?? 'เพิ่มสินค้าในรายการโปรดไม่สำเร็จ';
      })
      .addCase(removeFromWishlist.pending, (state, action) => {
        state.mutationError = null;
        state.entries = state.entries.filter((entry) => !sameItem(entry, action.meta.arg));
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.source = action.payload.source;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        if (!state.entries.some((entry) => sameItem(entry, action.meta.arg))) {
          state.entries.push(action.meta.arg);
          state.entries.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
        }
        state.mutationError = action.payload ?? 'นำสินค้าออกจากรายการโปรดไม่สำเร็จ';
      })
      // The list belongs to one customer — drop it whenever who's signed in changes.
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { clearWishlistError } = wishlistSlice.actions;

export const selectIsWishlisted = (state: WishlistRootState, category: ProductCategorySlug, productId: string) =>
  state.wishlist.entries.some((entry) => entry.category === category && entry.productId === productId);

export default wishlistSlice.reducer;

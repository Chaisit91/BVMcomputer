import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as paymentMethodApi from '../../api/paymentMethodApi';
import { getErrorMessage } from '../../api/apiError';
import { loginUser, logoutUser, sessionExpired } from '../auth/authSlice';
import type { CardToken } from '../../services/payment/cardTokenizer';
import type { AccountDataSource, PaymentMethod, RequestStatus } from '../../types/api';

interface PaymentMethodState {
  methods: PaymentMethod[];
  status: RequestStatus;
  error: string | null;
  /** 'demo' = kept in this browser only, not saved to the account. */
  source: AccountDataSource | null;
  /** Add / delete / set-default in flight — one at a time, so the buttons can lock. */
  mutationStatus: RequestStatus;
  mutationError: string | null;
}

const initialState: PaymentMethodState = {
  methods: [],
  status: 'idle',
  error: null,
  source: null,
  mutationStatus: 'idle',
  mutationError: null,
};

type PaymentMethodRootState = { paymentMethod: PaymentMethodState };
type ThunkConfig = { state: PaymentMethodRootState; rejectValue: string };

export const fetchPaymentMethods = createAsyncThunk<
  paymentMethodApi.PaymentMethodListResult,
  { force?: boolean } | undefined,
  ThunkConfig
>(
  'paymentMethod/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await paymentMethodApi.getPaymentMethods();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      const { status } = getState().paymentMethod;
      if (status === 'loading') return false;
      return Boolean(arg?.force) || status === 'idle';
    },
  },
);

/** Wraps one write call; every write resolves with the full updated list. */
function mutation<Arg>(type: string, call: (arg: Arg) => Promise<paymentMethodApi.PaymentMethodListResult>) {
  return createAsyncThunk<paymentMethodApi.PaymentMethodListResult, Arg, ThunkConfig>(
    type,
    async (arg, { rejectWithValue }) => {
      try {
        return await call(arg);
      } catch (error) {
        return rejectWithValue(getErrorMessage(error));
      }
    },
    { condition: (_, { getState }) => getState().paymentMethod.mutationStatus !== 'loading' },
  );
}

/** Takes an already-created gateway token — raw card data never reaches the store (or its devtools). */
export const addPaymentMethod = mutation('paymentMethod/add', ({ token, makeDefault }: { token: CardToken; makeDefault: boolean }) => {
  const { token: tokenId, ...card } = token;
  return paymentMethodApi.addPaymentMethod({ token: tokenId, makeDefault }, card);
});
export const setDefaultPaymentMethod = mutation('paymentMethod/setDefault', (id: string) => paymentMethodApi.setDefaultPaymentMethod(id));
export const deletePaymentMethod = mutation('paymentMethod/delete', (id: string) => paymentMethodApi.deletePaymentMethod(id));

const mutations = [addPaymentMethod, setDefaultPaymentMethod, deletePaymentMethod] as const;

const paymentMethodSlice = createSlice({
  name: 'paymentMethod',
  initialState,
  reducers: {
    clearPaymentMethodError: (state) => {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.methods = action.payload.methods;
        state.source = action.payload.source;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'โหลดช่องทางการชำระเงินไม่สำเร็จ';
      });

    for (const thunk of mutations) {
      builder
        .addCase(thunk.pending, (state) => {
          state.mutationStatus = 'loading';
          state.mutationError = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.mutationStatus = 'succeeded';
          state.methods = action.payload.methods;
          state.source = action.payload.source;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.mutationStatus = 'failed';
          state.mutationError = action.payload ?? 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
        });
    }

    // Cards belong to one customer — drop them whenever who's signed in changes.
    builder
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { clearPaymentMethodError } = paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;

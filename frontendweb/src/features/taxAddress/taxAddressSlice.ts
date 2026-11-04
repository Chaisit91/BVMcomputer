import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as taxAddressApi from '../../api/taxAddressApi';
import { getErrorMessage } from '../../api/apiError';
import { loginUser, logoutUser, sessionExpired } from '../auth/authSlice';
import type { AccountDataSource, RequestStatus, TaxAddress, TaxAddressInput } from '../../types/api';

interface TaxAddressState {
  addresses: TaxAddress[];
  status: RequestStatus;
  error: string | null;
  /** 'demo' = kept in this browser only, not saved to the account. */
  source: AccountDataSource | null;
  /** Add / edit / delete / set-default in flight — one at a time, so the buttons can lock. */
  mutationStatus: RequestStatus;
  mutationError: string | null;
}

const initialState: TaxAddressState = {
  addresses: [],
  status: 'idle',
  error: null,
  source: null,
  mutationStatus: 'idle',
  mutationError: null,
};

type TaxAddressRootState = { taxAddress: TaxAddressState };
type ThunkConfig = { state: TaxAddressRootState; rejectValue: string };

export const fetchTaxAddresses = createAsyncThunk<taxAddressApi.TaxAddressListResult, { force?: boolean } | undefined, ThunkConfig>(
  'taxAddress/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await taxAddressApi.getTaxAddresses();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      const { status } = getState().taxAddress;
      if (status === 'loading') return false;
      return Boolean(arg?.force) || status === 'idle';
    },
  },
);

/** Wraps one write call; every write resolves with the full updated list. */
function mutation<Arg>(type: string, call: (arg: Arg) => Promise<taxAddressApi.TaxAddressListResult>) {
  return createAsyncThunk<taxAddressApi.TaxAddressListResult, Arg, ThunkConfig>(
    type,
    async (arg, { rejectWithValue }) => {
      try {
        return await call(arg);
      } catch (error) {
        return rejectWithValue(getErrorMessage(error));
      }
    },
    { condition: (_, { getState }) => getState().taxAddress.mutationStatus !== 'loading' },
  );
}

export const createTaxAddress = mutation('taxAddress/create', (input: TaxAddressInput) => taxAddressApi.createTaxAddress(input));
export const updateTaxAddress = mutation('taxAddress/update', ({ id, input }: { id: string; input: TaxAddressInput }) =>
  taxAddressApi.updateTaxAddress(id, input),
);
export const setDefaultTaxAddress = mutation('taxAddress/setDefault', (id: string) => taxAddressApi.setDefaultTaxAddress(id));
export const deleteTaxAddress = mutation('taxAddress/delete', (id: string) => taxAddressApi.deleteTaxAddress(id));

const mutations = [createTaxAddress, updateTaxAddress, setDefaultTaxAddress, deleteTaxAddress] as const;

const taxAddressSlice = createSlice({
  name: 'taxAddress',
  initialState,
  reducers: {
    clearTaxAddressError: (state) => {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxAddresses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTaxAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.addresses = action.payload.addresses;
        state.source = action.payload.source;
      })
      .addCase(fetchTaxAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'โหลดที่อยู่สำหรับออกใบกำกับภาษีไม่สำเร็จ';
      });

    for (const thunk of mutations) {
      builder
        .addCase(thunk.pending, (state) => {
          state.mutationStatus = 'loading';
          state.mutationError = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.mutationStatus = 'succeeded';
          state.addresses = action.payload.addresses;
          state.source = action.payload.source;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.mutationStatus = 'failed';
          state.mutationError = action.payload ?? 'บันทึกที่อยู่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
        });
    }

    // Addresses belong to one customer — drop them whenever who's signed in changes.
    builder
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { clearTaxAddressError } = taxAddressSlice.actions;
export default taxAddressSlice.reducer;

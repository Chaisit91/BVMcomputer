import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as addressApi from '../../api/addressApi';
import { getErrorMessage } from '../../api/apiError';
import { loginUser, logoutUser, sessionExpired } from '../auth/authSlice';
import type { AccountDataSource, RequestStatus, SavedAddress, SavedAddressInput } from '../../types/api';

interface AddressState {
  addresses: SavedAddress[];
  status: RequestStatus;
  error: string | null;
  /** 'demo' = kept in this browser only, not saved to the account. */
  source: AccountDataSource | null;
  /** Add / edit / delete / set-default in flight — one at a time, so the buttons can lock. */
  mutationStatus: RequestStatus;
  mutationError: string | null;
}

const initialState: AddressState = {
  addresses: [],
  status: 'idle',
  error: null,
  source: null,
  mutationStatus: 'idle',
  mutationError: null,
};

type AddressRootState = { address: AddressState };
type ThunkConfig = { state: AddressRootState; rejectValue: string };

export const fetchAddresses = createAsyncThunk<addressApi.AddressListResult, { force?: boolean } | undefined, ThunkConfig>(
  'address/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await addressApi.getAddresses();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      const { status } = getState().address;
      if (status === 'loading') return false;
      return Boolean(arg?.force) || status === 'idle';
    },
  },
);

/** Wraps one write call; every write resolves with the full updated list. */
function mutation<Arg>(type: string, call: (arg: Arg) => Promise<addressApi.AddressListResult>) {
  return createAsyncThunk<addressApi.AddressListResult, Arg, ThunkConfig>(
    type,
    async (arg, { rejectWithValue }) => {
      try {
        return await call(arg);
      } catch (error) {
        return rejectWithValue(getErrorMessage(error));
      }
    },
    { condition: (_, { getState }) => getState().address.mutationStatus !== 'loading' },
  );
}

export const createAddress = mutation('address/create', (input: SavedAddressInput) => addressApi.createAddress(input));
export const updateAddress = mutation('address/update', ({ id, input }: { id: string; input: SavedAddressInput }) =>
  addressApi.updateAddress(id, input),
);
export const setDefaultAddress = mutation('address/setDefault', (id: string) => addressApi.setDefaultAddress(id));
export const deleteAddress = mutation('address/delete', (id: string) => addressApi.deleteAddress(id));

const mutations = [createAddress, updateAddress, setDefaultAddress, deleteAddress] as const;

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearAddressError: (state) => {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.addresses = action.payload.addresses;
        state.source = action.payload.source;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'โหลดที่อยู่ไม่สำเร็จ';
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

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as orderHistoryApi from '../../api/orderHistoryApi';
import { getErrorMessage, toApiError } from '../../api/apiError';
import { loginUser, logoutUser, sessionExpired } from '../auth/authSlice';
import type { AccountDataSource, OrderDetail, OrderSummary, RequestStatus } from '../../types/api';

interface OrderDetailEntry {
  status: RequestStatus;
  order: OrderDetail | null;
  error: string | null;
  /** 404 — no such order for this customer (as opposed to a failed request worth retrying). */
  notFound: boolean;
}

interface OrderHistoryState {
  orders: OrderSummary[];
  status: RequestStatus;
  error: string | null;
  source: AccountDataSource | null;
  /** Full orders already opened, by id — each loads on its own. */
  details: Record<string, OrderDetailEntry>;
}

const initialState: OrderHistoryState = {
  orders: [],
  status: 'idle',
  error: null,
  source: null,
  details: {},
};

type ThunkConfig = { state: { orderHistory: OrderHistoryState }; rejectValue: string };

export const fetchOrders = createAsyncThunk<orderHistoryApi.OrderListResult, { force?: boolean } | undefined, ThunkConfig>(
  'orderHistory/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      return await orderHistoryApi.getOrders();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      const { status } = getState().orderHistory;
      if (status === 'loading') return false;
      return Boolean(arg?.force) || status === 'idle';
    },
  },
);

export const fetchOrderDetail = createAsyncThunk<
  orderHistoryApi.OrderDetailResult,
  { id: string; force?: boolean },
  { state: ThunkConfig['state']; rejectValue: { message: string; notFound: boolean } }
>(
  'orderHistory/fetchDetail',
  async ({ id }, { rejectWithValue }) => {
    try {
      return await orderHistoryApi.getOrder(id);
    } catch (error) {
      const apiError = toApiError(error);
      return rejectWithValue({ message: apiError.message, notFound: apiError.status === 404 });
    }
  },
  {
    condition: ({ id, force }, { getState }) => {
      const entry = getState().orderHistory.details[id];
      if (!entry) return true;
      if (entry.status === 'loading') return false;
      return Boolean(force) || entry.status !== 'succeeded';
    },
  },
);

const orderHistorySlice = createSlice({
  name: 'orderHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload.orders;
        state.source = action.payload.source;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'โหลดคำสั่งซื้อไม่สำเร็จ';
      })
      .addCase(fetchOrderDetail.pending, (state, action) => {
        const { id } = action.meta.arg;
        state.details[id] = { status: 'loading', order: state.details[id]?.order ?? null, error: null, notFound: false };
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.details[action.meta.arg.id] = { status: 'succeeded', order: action.payload.order, error: null, notFound: false };
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.details[action.meta.arg.id] = {
          status: 'failed',
          order: null,
          error: action.payload?.message ?? 'โหลดรายละเอียดคำสั่งซื้อไม่สำเร็จ',
          notFound: action.payload?.notFound ?? false,
        };
      })
      // Orders belong to one customer — drop them whenever who's signed in changes.
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export default orderHistorySlice.reducer;

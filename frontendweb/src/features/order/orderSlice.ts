import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createOrder } from '../../api/orderApi';
import { getErrorMessage } from '../../api/apiError';
import { clearCart } from '../cart/cartSlice';
import type { CreateOrderRequest, CreateOrderResponse, RequestStatus } from '../../types/api';

interface OrderState {
  status: RequestStatus;
  error: string | null;
  /** The order just placed — drives the checkout success screen. */
  lastOrder: CreateOrderResponse | null;
}

const initialState: OrderState = {
  status: 'idle',
  error: null,
  lastOrder: null,
};

export const placeOrder = createAsyncThunk<CreateOrderResponse, CreateOrderRequest, { rejectValue: string }>(
  'order/place',
  async (request, { dispatch, rejectWithValue }) => {
    try {
      const order = await createOrder(request);
      // Only empty the cart once the backend has actually accepted the order.
      dispatch(clearCart());
      return order;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrder: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'สั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
      });
  },
});

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;

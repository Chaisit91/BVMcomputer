import { configureStore } from '@reduxjs/toolkit';
import { setUnauthorizedHandler } from '../api/axiosClient';
import authReducer, { sessionExpired } from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import cartUiReducer from '../features/cart/cartUiSlice';
import catalogReducer from '../features/catalog/catalogSlice';
import chatReducer from '../features/chat/chatSlice';
import homeReducer from '../features/home/homeSlice';
import orderReducer from '../features/order/orderSlice';
import productDetailReducer from '../features/productDetail/productDetailSlice';
import searchReducer from '../features/search/searchSlice';
import upgradeReducer from '../features/upgrade/upgradeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    cartUi: cartUiReducer,
    catalog: catalogReducer,
    chat: chatReducer,
    home: homeReducer,
    order: orderReducer,
    productDetail: productDetailReducer,
    search: searchReducer,
    upgrade: upgradeReducer,
  },
});

// Any 401 from an authenticated request logs the user out of the UI too.
setUnauthorizedHandler(() => store.dispatch(sessionExpired()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

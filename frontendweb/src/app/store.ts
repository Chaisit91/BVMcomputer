import { configureStore } from '@reduxjs/toolkit';
import { setUnauthorizedHandler } from '../api/axiosClient';
import authReducer, { sessionExpired } from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import cartUiReducer from '../features/cart/cartUiSlice';
import cartRecommendationReducer from '../features/cart/cartRecommendationSlice';
import catalogReducer from '../features/catalog/catalogSlice';
import accountReducer from '../features/account/accountSlice';
import addressReducer from '../features/address/addressSlice';
import chatReducer from '../features/chat/chatSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import homeReducer from '../features/home/homeSlice';
import orderReducer from '../features/order/orderSlice';
import productDetailReducer from '../features/productDetail/productDetailSlice';
import searchReducer from '../features/search/searchSlice';
import upgradeReducer from '../features/upgrade/upgradeSlice';
import upgradeAnalysisReducer from '../features/upgrade/upgradeAnalysisSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import taxAddressReducer from '../features/taxAddress/taxAddressSlice';
import paymentMethodReducer from '../features/paymentMethod/paymentMethodSlice';
import orderHistoryReducer from '../features/orderHistory/orderHistorySlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    address: addressReducer,
    auth: authReducer,
    cart: cartReducer,
    cartUi: cartUiReducer,
    cartRecommendation: cartRecommendationReducer,
    catalog: catalogReducer,
    chat: chatReducer,
    checkout: checkoutReducer,
    home: homeReducer,
    order: orderReducer,
    productDetail: productDetailReducer,
    search: searchReducer,
    upgrade: upgradeReducer,
    upgradeAnalysis: upgradeAnalysisReducer,
    wishlist: wishlistReducer,
    taxAddress: taxAddressReducer,
    paymentMethod: paymentMethodReducer,
    orderHistory: orderHistoryReducer,
  },
});

// Any 401 from an authenticated request logs the user out of the UI too.
setUnauthorizedHandler(() => store.dispatch(sessionExpired()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

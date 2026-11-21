import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loginUser, logoutUser, sessionExpired } from '../auth/authSlice';
import type { PaymentMethodId, ShippingMethodId } from '../../types/api';

/**
 * What the customer had picked on the checkout page, kept while they hop over to the account
 * pages to add a shipping / tax-invoice address. The checkout page unmounts during that trip, so
 * without this the shipping method, payment method, coupon and "ขอใบกำกับภาษี" would reset.
 * It is a one-shot snapshot: the checkout page reads it once when it mounts, then clears it.
 */
export interface CheckoutDraft {
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
  couponCode: string;
  coupon: { code: string; discount: number } | null;
  taxRequested: boolean;
  /** Saved account address chosen for this order (not the account's default — that is never changed here). */
  selectedAddressId: string | null;
  selectedTaxAddressId: string | null;
}

const emptyDraft: CheckoutDraft = {
  shippingMethod: 'standard',
  paymentMethod: 'bank',
  couponCode: '',
  coupon: null,
  taxRequested: false,
  selectedAddressId: null,
  selectedTaxAddressId: null,
};

interface CheckoutState {
  draft: CheckoutDraft | null;
}

const initialState: CheckoutState = { draft: null };

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    saveCheckoutDraft: (state, action: PayloadAction<CheckoutDraft>) => {
      state.draft = action.payload;
    },
    clearCheckoutDraft: (state) => {
      state.draft = null;
    },
    /**
     * Called by the account page right after an address added from checkout was saved, so the
     * checkout page comes back with that address selected. Works even if the draft was lost
     * (e.g. the account page was reloaded) — the other picks then just start from their defaults.
     */
    selectAddressForCheckout: (state, action: PayloadAction<{ kind: 'address' | 'tax'; id: string }>) => {
      const draft = state.draft ?? { ...emptyDraft };
      if (action.payload.kind === 'address') {
        draft.selectedAddressId = action.payload.id;
      } else {
        draft.selectedTaxAddressId = action.payload.id;
        draft.taxRequested = true;
      }
      state.draft = draft;
    },
  },
  extraReducers: (builder) => {
    // Picks refer to one customer's saved addresses — drop them when who's signed in changes.
    builder
      .addCase(loginUser.fulfilled, () => initialState)
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { saveCheckoutDraft, clearCheckoutDraft, selectAddressForCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;

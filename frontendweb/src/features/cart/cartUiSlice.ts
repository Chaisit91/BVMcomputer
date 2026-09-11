import { createSlice } from '@reduxjs/toolkit';

interface CartUiState {
  isOpen: boolean;
}

const initialState: CartUiState = {
  isOpen: false,
};

const cartUiSlice = createSlice({
  name: 'cartUi',
  initialState,
  reducers: {
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openCart, closeCart, toggleCart } = cartUiSlice.actions;
export default cartUiSlice.reducer;

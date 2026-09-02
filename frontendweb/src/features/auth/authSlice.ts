import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
};

// TODO(backend): this is a mock login — accepts any email/password until the
// real auth endpoint is connected, so the rest of the site can be built and
// tested behind a "logged in" state in the meantime.
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.email = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.email = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

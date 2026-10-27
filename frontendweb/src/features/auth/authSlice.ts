import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';
import { clearSession, loadSession, saveSession } from '../../api/authSession';
import { getErrorMessage } from '../../api/apiError';
import type { AuthUser, LoginRequest, RequestStatus } from '../../types/api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Kept alongside `user` because the account menu only needs the email. */
  email: string | null;
  loginStatus: RequestStatus;
  loginError: string | null;
  /** Startup check of the stored session against GET /auth/me. */
  sessionStatus: RequestStatus;
}

// Show the stored user immediately on page load; restoreSession() then confirms it with the backend.
const storedUser = loadSession()?.user ?? null;

const initialState: AuthState = {
  user: storedUser,
  isAuthenticated: storedUser !== null,
  email: storedUser?.email ?? null,
  loginStatus: 'idle',
  loginError: null,
  sessionStatus: 'idle',
};

export const loginUser = createAsyncThunk<AuthUser, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (request, { rejectWithValue }) => {
    try {
      const { user, token } = await authApi.login(request);
      saveSession({ token: token ?? null, user }, request.remember);
      return user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    // Logging out locally must always succeed, even if the server call fails.
  } finally {
    clearSession();
  }
});

/** Called once on app start: verifies the stored session is still valid server-side. */
export const restoreSession = createAsyncThunk<AuthUser | null, void, { state: { auth: AuthState } }>(
  'auth/restoreSession',
  async () => {
    if (!loadSession()) return null;
    try {
      return await authApi.getCurrentUser();
    } catch {
      clearSession();
      return null;
    }
  },
  // Only once per page load (StrictMode runs mount effects twice in dev).
  { condition: (_, { getState }) => getState().auth.sessionStatus === 'idle' },
);

function setUser(state: AuthState, user: AuthUser | null) {
  state.user = user;
  state.isAuthenticated = user !== null;
  state.email = user?.email ?? null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Dispatched by the axios client (which also clears storage) when the backend answers 401. */
    sessionExpired: (state) => {
      setUser(state, null);
    },
    clearLoginError: (state) => {
      state.loginStatus = 'idle';
      state.loginError = null;
    },
    /** After the customer edits their profile, keep the signed-in user's display details current. */
    updateAuthUser: (state, action: PayloadAction<Partial<Omit<AuthUser, 'id'>>>) => {
      if (state.user) setUser(state, { ...state.user, ...action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = 'loading';
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginStatus = 'succeeded';
        setUser(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.loginError = action.payload ?? 'เข้าสู่ระบบไม่สำเร็จ';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        setUser(state, null);
        state.loginStatus = 'idle';
      })
      .addCase(restoreSession.pending, (state) => {
        state.sessionStatus = 'loading';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.sessionStatus = 'succeeded';
        // A login that finished while the check was in flight wins over a stale "no session".
        if (action.payload || state.loginStatus !== 'succeeded') setUser(state, action.payload);
      });
  },
});

export const { sessionExpired, clearLoginError, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;

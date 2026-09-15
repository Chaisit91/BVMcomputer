import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getSession } from '../services/auth.service'
import type { LoginResponse } from '../types/auth'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: LoginResponse['user'] | null
  status: AuthStatus
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
}

export const checkSession = createAsyncThunk('auth/checkSession', () => getSession())

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<LoginResponse['user']>) {
      state.user = action.payload
      state.status = 'authenticated'
    },
    clearUser(state) {
      state.user = null
      state.status = 'unauthenticated'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.status = 'authenticated'
      })
      .addCase(checkSession.rejected, (state) => {
        state.user = null
        state.status = 'unauthenticated'
      })
  },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer

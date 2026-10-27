import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as accountApi from '../../api/accountApi';
import { getErrorMessage } from '../../api/apiError';
import { logoutUser, sessionExpired, updateAuthUser } from '../auth/authSlice';
import type { AccountDataSource, AccountSummary, RequestStatus, UpdateProfileRequest, UserProfile } from '../../types/api';

interface AccountState {
  profile: UserProfile | null;
  /** Where `profile` came from — 'demo' means it was built locally, not loaded from the server. */
  source: AccountDataSource | null;
  loadStatus: RequestStatus;
  loadError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
  /** Source of the last successful save — a 'demo' save never reached the server. */
  saveSource: AccountDataSource | null;
  avatarStatus: RequestStatus;
  avatarError: string | null;
  avatarSource: AccountDataSource | null;
  /** Order / wishlist / shipping / unpaid counts — null until the backend has actually provided them. */
  summary: AccountSummary | null;
  summaryStatus: RequestStatus;
}

const initialState: AccountState = {
  profile: null,
  source: null,
  loadStatus: 'idle',
  loadError: null,
  saveStatus: 'idle',
  saveError: null,
  saveSource: null,
  avatarStatus: 'idle',
  avatarError: null,
  avatarSource: null,
  summary: null,
  summaryStatus: 'idle',
};

type AccountRootState = { account: AccountState };

export const fetchProfile = createAsyncThunk<accountApi.ProfileResult, void, { state: AccountRootState; rejectValue: string }>(
  'account/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await accountApi.getProfile();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: (_, { getState }) => getState().account.loadStatus !== 'loading' },
);

export const saveProfile = createAsyncThunk<
  accountApi.ProfileResult,
  UpdateProfileRequest,
  { state: AccountRootState; rejectValue: string }
>('account/saveProfile', async (changes, { getState, dispatch, rejectWithValue }) => {
  const current = getState().account.profile;
  if (!current) return rejectWithValue('ยังไม่ได้โหลดข้อมูลบัญชี');
  try {
    const result = await accountApi.updateProfile(current, changes);
    // Keep the header's account menu in step with a name change that really was saved.
    if (result.source === 'live') {
      dispatch(updateAuthUser({ name: `${result.profile.firstName} ${result.profile.lastName}`.trim() }));
    }
    return result;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAccountSummary = createAsyncThunk<
  { summary: AccountSummary | null; source: AccountDataSource },
  void,
  { state: AccountRootState; rejectValue: string }
>(
  'account/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await accountApi.getAccountSummary();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: (_, { getState }) => getState().account.summaryStatus !== 'loading' },
);

export const uploadProfileAvatar = createAsyncThunk<
  { avatarUrl: string | null; source: AccountDataSource },
  File,
  { rejectValue: string }
>('account/uploadAvatar', async (file, { rejectWithValue }) => {
  try {
    return await accountApi.uploadAvatar(file);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    /** Clear the save banner when the customer starts editing again. */
    resetSaveStatus: (state) => {
      state.saveStatus = 'idle';
      state.saveError = null;
      state.saveSource = null;
    },
    resetAvatarStatus: (state) => {
      state.avatarStatus = 'idle';
      state.avatarError = null;
      state.avatarSource = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loadStatus = 'loading';
        state.loadError = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.profile = action.payload.profile;
        state.source = action.payload.source;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loadStatus = 'failed';
        state.loadError = action.payload ?? 'โหลดข้อมูลบัญชีไม่สำเร็จ';
      })
      .addCase(saveProfile.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
        state.saveSource = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.saveSource = action.payload.source;
        // Only a save the server confirmed becomes the profile — a demo save must not make the
        // summary page show unsaved values as if they were stored.
        if (action.payload.source === 'live') state.profile = action.payload.profile;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload ?? 'บันทึกข้อมูลไม่สำเร็จ';
      })
      .addCase(uploadProfileAvatar.pending, (state) => {
        state.avatarStatus = 'loading';
        state.avatarError = null;
        state.avatarSource = null;
      })
      .addCase(uploadProfileAvatar.fulfilled, (state, action) => {
        state.avatarStatus = 'succeeded';
        state.avatarSource = action.payload.source;
        if (state.profile && action.payload.avatarUrl) state.profile.avatarUrl = action.payload.avatarUrl;
      })
      .addCase(uploadProfileAvatar.rejected, (state, action) => {
        state.avatarStatus = 'failed';
        state.avatarError = action.payload ?? 'อัปโหลดรูปไม่สำเร็จ';
      })
      .addCase(fetchAccountSummary.pending, (state) => {
        state.summaryStatus = 'loading';
      })
      .addCase(fetchAccountSummary.fulfilled, (state, action) => {
        state.summaryStatus = 'succeeded';
        state.summary = action.payload.summary;
      })
      .addCase(fetchAccountSummary.rejected, (state) => {
        state.summaryStatus = 'failed';
      })
      // A different customer may sign in next on this browser — never show the previous profile.
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { resetSaveStatus, resetAvatarStatus } = accountSlice.actions;
export default accountSlice.reducer;

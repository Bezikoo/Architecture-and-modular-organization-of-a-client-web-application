import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../api/userApi';
import type { User, PaginationData, UserFormData } from '../types/user';
import type { RootState } from './index';

interface UsersState {
  users: User[];
  selectedUser: User | null;
  pagination: PaginationData | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  pagination: null,
  loading: false,
  success: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    const { ui } = getState() as RootState;
    try {
      return await userApi.getUsers({
        page: ui.page,
        search: ui.search,
        sortBy: ui.sortBy,
        order: ui.order,
      });
    } catch {
      return rejectWithValue('Failed to load users. Make sure the server is running.');
    }
  },
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: UserFormData, { dispatch, rejectWithValue }) => {
    try {
      const user = await userApi.createUser(userData);
      dispatch(fetchUsers());
      return user;
    } catch {
      return rejectWithValue('Failed to create user');
    }
  },
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: number; userData: UserFormData }, { dispatch, rejectWithValue }) => {
    try {
      const user = await userApi.updateUser(id, userData);
      dispatch(fetchUsers());
      return user;
    } catch {
      return rejectWithValue('Failed to update user');
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await userApi.deleteUser(id);
      dispatch(fetchUsers());
      return id;
    } catch {
      return rejectWithValue('Failed to delete user');
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    selectUser(state, action) {
      state.selectedUser = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { selectUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;

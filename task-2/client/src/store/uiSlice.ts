import { createSlice } from '@reduxjs/toolkit';
import { createUser, updateUser } from './usersSlice';

interface UiState {
  search: string;
  sortBy: string;
  order: string;
  page: number;
  isFormOpen: boolean;
}

function loadPersistedUi(): Partial<UiState> {
  return {
    search: localStorage.getItem('users_search') ?? '',
    page: Number(localStorage.getItem('users_page')) || 1,
  };
}

const initialState: UiState = {
  search: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: 1,
  isFormOpen: false,
  ...loadPersistedUi(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1;
      localStorage.setItem('users_search', action.payload);
      localStorage.setItem('users_page', '1');
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setOrder(state, action) {
      state.order = action.payload;
    },
    setPage(state, action) {
      state.page = action.payload;
      localStorage.setItem('users_page', String(action.payload));
    },
    openForm(state) {
      state.isFormOpen = true;
    },
    closeForm(state) {
      state.isFormOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.fulfilled, (state) => {
        state.isFormOpen = false;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.isFormOpen = false;
      });
  },
});

export const { setSearch, setSortBy, setOrder, setPage, openForm, closeForm } = uiSlice.actions;
export default uiSlice.reducer;

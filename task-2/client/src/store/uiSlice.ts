import { createSlice } from '@reduxjs/toolkit';
import { createTicket, updateTicket } from './ticketsSlice';

interface UiState {
  search: string;
  sortBy: string;
  order: string;
  page: number;
  categoryFilter: string;
  statusFilter: string;
  isFormOpen: boolean;
  viewMode: 'edit' | 'view' | null;
}

const STORAGE_KEYS = {
  search: 'tickets_search',
  page: 'tickets_page',
  category: 'tickets_category',
  status: 'tickets_status',
};

function loadPersistedUi(): Partial<UiState> {
  return {
    search: localStorage.getItem(STORAGE_KEYS.search) ?? '',
    page: Number(localStorage.getItem(STORAGE_KEYS.page)) || 1,
    categoryFilter: localStorage.getItem(STORAGE_KEYS.category) ?? '',
    statusFilter: localStorage.getItem(STORAGE_KEYS.status) ?? '',
  };
}

const initialState: UiState = {
  search: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: 1,
  categoryFilter: '',
  statusFilter: '',
  isFormOpen: false,
  viewMode: null,
  ...loadPersistedUi(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1;
      localStorage.setItem(STORAGE_KEYS.search, action.payload);
      localStorage.setItem(STORAGE_KEYS.page, '1');
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setOrder(state, action) {
      state.order = action.payload;
    },
    setPage(state, action) {
      state.page = action.payload;
      localStorage.setItem(STORAGE_KEYS.page, String(action.payload));
    },
    setCategoryFilter(state, action) {
      state.categoryFilter = action.payload;
      state.page = 1;
      localStorage.setItem(STORAGE_KEYS.category, action.payload);
      localStorage.setItem(STORAGE_KEYS.page, '1');
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
      state.page = 1;
      localStorage.setItem(STORAGE_KEYS.status, action.payload);
      localStorage.setItem(STORAGE_KEYS.page, '1');
    },
    openForm(state, action) {
      state.isFormOpen = true;
      state.viewMode = action.payload ?? 'edit';
    },
    closeForm(state) {
      state.isFormOpen = false;
      state.viewMode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.fulfilled, (state) => {
        state.isFormOpen = false;
        state.viewMode = null;
      })
      .addCase(updateTicket.fulfilled, (state) => {
        state.isFormOpen = false;
        state.viewMode = null;
      });
  },
});

export const {
  setSearch,
  setSortBy,
  setOrder,
  setPage,
  setCategoryFilter,
  setStatusFilter,
  openForm,
  closeForm,
} = uiSlice.actions;
export default uiSlice.reducer;

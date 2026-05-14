import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ticketApi } from '../api/ticketApi';
import type { Ticket, PaginationData, TicketFormData } from '../types/ticket';
import type { RootState } from './index';

interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  pagination: PaginationData | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  selectedTicket: null,
  pagination: null,
  loading: false,
  success: false,
  error: null,
};

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (_, { getState, rejectWithValue }) => {
    const { ui } = getState() as RootState;
    try {
      return await ticketApi.getTickets({
        page: ui.page,
        search: ui.search,
        sortBy: ui.sortBy,
        order: ui.order,
        category: ui.categoryFilter,
        status: ui.statusFilter,
      });
    } catch {
      return rejectWithValue('Не вдалося завантажити заявки. Перевірте, чи запущено сервер.');
    }
  },
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await ticketApi.getTicketById(id);
    } catch {
      return rejectWithValue('Не вдалося отримати заявку');
    }
  },
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (data: TicketFormData, { dispatch, rejectWithValue }) => {
    try {
      const ticket = await ticketApi.createTicket(data);
      dispatch(fetchTickets());
      return ticket;
    } catch {
      return rejectWithValue('Не вдалося створити заявку');
    }
  },
);

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, data }: { id: number; data: TicketFormData }, { dispatch, rejectWithValue }) => {
    try {
      const ticket = await ticketApi.updateTicket(id, data);
      dispatch(fetchTickets());
      return ticket;
    } catch {
      return rejectWithValue('Не вдалося оновити заявку');
    }
  },
);

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await ticketApi.deleteTicket(id);
      dispatch(fetchTickets());
      return id;
    } catch {
      return rejectWithValue('Не вдалося видалити заявку');
    }
  },
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    selectTicket(state, action) {
      state.selectedTicket = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.selectedTicket = action.payload;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { selectTicket, clearError } = ticketsSlice.actions;
export default ticketsSlice.reducer;

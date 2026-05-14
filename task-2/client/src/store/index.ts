import { configureStore } from '@reduxjs/toolkit';
import ticketsReducer from './ticketsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

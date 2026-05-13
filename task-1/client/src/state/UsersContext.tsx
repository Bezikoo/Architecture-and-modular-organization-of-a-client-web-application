import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { usersReducer, initialState } from './usersReducer';
import type { UsersState, UsersAction } from './usersReducer';

interface UsersContextValue {
  state: UsersState;
  dispatch: React.Dispatch<UsersAction>;
}

const UsersContext = createContext<UsersContextValue | null>(null);

function getPersistedState(): UsersState {
  return {
    ...initialState,
    ui: {
      ...initialState.ui,
      search: localStorage.getItem('users_search') ?? '',
      page: Number(localStorage.getItem('users_page')) || 1,
    },
  };
}

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(usersReducer, undefined, getPersistedState);

  useEffect(() => {
    localStorage.setItem('users_search', state.ui.search);
    localStorage.setItem('users_page', String(state.ui.page));
  }, [state.ui.search, state.ui.page]);

  return (
    <UsersContext.Provider value={{ state, dispatch }}>
      {children}
    </UsersContext.Provider>
  );
};

export function useUsersContext(): UsersContextValue {
  const context = useContext(UsersContext);
  if (!context) throw new Error('useUsersContext must be used within UsersProvider');
  return context;
}

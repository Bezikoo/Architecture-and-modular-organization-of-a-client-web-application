import type { User, PaginationData } from '../types/user';

export interface UsersState {
  data: {
    users: User[];
    selectedUser: User | null;
    pagination: PaginationData | null;
  };
  ui: {
    search: string;
    sortBy: string;
    order: string;
    page: number;
    isFormOpen: boolean;
  };
  status: {
    loading: boolean;
    success: boolean;
    error: string | null;
  };
}

export type UsersAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { users: User[]; pagination: PaginationData } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SELECT_USER'; payload: User | null }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_ORDER'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'OPEN_FORM' }
  | { type: 'CLOSE_FORM' }
  | { type: 'OPERATION_ERROR'; payload: string };

export const initialState: UsersState = {
  data: {
    users: [],
    selectedUser: null,
    pagination: null,
  },
  ui: {
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    isFormOpen: false,
  },
  status: {
    loading: false,
    success: false,
    error: null,
  },
};

export function usersReducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        status: { loading: true, success: false, error: null },
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: {
          ...state.data,
          users: action.payload.users,
          pagination: action.payload.pagination,
        },
        status: { loading: false, success: true, error: null },
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        status: { loading: false, success: false, error: action.payload },
      };
    case 'SELECT_USER':
      return {
        ...state,
        data: { ...state.data, selectedUser: action.payload },
      };
    case 'SET_SEARCH':
      return {
        ...state,
        ui: { ...state.ui, search: action.payload, page: 1 },
      };
    case 'SET_SORT_BY':
      return {
        ...state,
        ui: { ...state.ui, sortBy: action.payload },
      };
    case 'SET_ORDER':
      return {
        ...state,
        ui: { ...state.ui, order: action.payload },
      };
    case 'SET_PAGE':
      return {
        ...state,
        ui: { ...state.ui, page: action.payload },
      };
    case 'OPEN_FORM':
      return {
        ...state,
        ui: { ...state.ui, isFormOpen: true },
        status: { ...state.status, error: null },
      };
    case 'CLOSE_FORM':
      return {
        ...state,
        ui: { ...state.ui, isFormOpen: false },
        data: { ...state.data, selectedUser: null },
      };
    case 'OPERATION_ERROR':
      return {
        ...state,
        status: { ...state.status, error: action.payload },
      };
    default:
      return state;
  }
}

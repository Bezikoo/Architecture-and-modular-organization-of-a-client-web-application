import { useEffect, useCallback } from 'react';
import { userApi } from '../api/userApi';
import { useUsersContext } from '../state/UsersContext';
import type { UserFormData } from '../types/user';
import type { User } from '../types/user';

export function useUsers() {
  const { state, dispatch } = useUsersContext();
  const { ui } = state;

  const fetchUsers = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await userApi.getUsers({
        page: ui.page,
        search: ui.search,
        sortBy: ui.sortBy,
        order: ui.order,
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch {
      dispatch({ type: 'FETCH_ERROR', payload: 'Failed to load users. Make sure the server is running.' });
    }
  }, [dispatch, ui.page, ui.search, ui.sortBy, ui.order]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (formData: UserFormData) => {
    try {
      await userApi.createUser(formData);
      dispatch({ type: 'CLOSE_FORM' });
      await fetchUsers();
    } catch {
      dispatch({ type: 'OPERATION_ERROR', payload: 'Failed to create user' });
    }
  };

  const updateUser = async (id: number, formData: UserFormData) => {
    try {
      await userApi.updateUser(id, formData);
      dispatch({ type: 'CLOSE_FORM' });
      await fetchUsers();
    } catch {
      dispatch({ type: 'OPERATION_ERROR', payload: 'Failed to update user' });
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userApi.deleteUser(id);
      await fetchUsers();
    } catch {
      dispatch({ type: 'OPERATION_ERROR', payload: 'Failed to delete user' });
    }
  };

  const openEditForm = (user: User) => {
    dispatch({ type: 'SELECT_USER', payload: user });
    dispatch({ type: 'OPEN_FORM' });
  };

  const openCreateForm = () => {
    dispatch({ type: 'SELECT_USER', payload: null });
    dispatch({ type: 'OPEN_FORM' });
  };

  const closeForm = () => {
    dispatch({ type: 'CLOSE_FORM' });
  };

  return {
    state,
    dispatch,
    createUser,
    updateUser,
    deleteUser,
    openEditForm,
    openCreateForm,
    closeForm,
  };
}

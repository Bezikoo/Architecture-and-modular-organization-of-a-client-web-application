import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  selectUser,
  clearError,
} from '../store/usersSlice';
import { setPage, openForm, closeForm } from '../store/uiSlice';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import FilterPanel from '../components/FilterPanel';
import type { User, UserFormData } from '../types/user';

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const users = useAppSelector((s) => s.users.users);
  const selectedUser = useAppSelector((s) => s.users.selectedUser);
  const pagination = useAppSelector((s) => s.users.pagination);
  const loading = useAppSelector((s) => s.users.loading);
  const error = useAppSelector((s) => s.users.error);
  const isFormOpen = useAppSelector((s) => s.ui.isFormOpen);
  const page = useAppSelector((s) => s.ui.page);
  const search = useAppSelector((s) => s.ui.search);
  const sortBy = useAppSelector((s) => s.ui.sortBy);
  const order = useAppSelector((s) => s.ui.order);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch, page, search, sortBy, order]);

  const handleEdit = (user: User) => {
    dispatch(selectUser(user));
    dispatch(openForm());
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  const handleSubmit = (formData: UserFormData) => {
    if (selectedUser) {
      dispatch(updateUser({ id: selectedUser.id, userData: formData }));
    } else {
      dispatch(createUser(formData));
    }
  };

  const handleCloseForm = () => {
    dispatch(closeForm());
    dispatch(selectUser(null));
  };

  return (
    <div className="users-page">
      <h1>User Management</h1>

      <FilterPanel />

      {error && (
        <div className="error-message" onClick={() => dispatch(clearError())}>
          {error} <span className="error-close">✕</span>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <UserTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {pagination && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => dispatch(setPage(page - 1))}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => dispatch(setPage(page + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isFormOpen && (
        <div className="modal">
          <UserForm
            onSubmit={handleSubmit}
            initialData={selectedUser}
            onCancel={handleCloseForm}
          />
        </div>
      )}
    </div>
  );
};

export default UsersPage;

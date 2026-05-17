import React from 'react';
import { useUsers } from '../hooks/useUsers';
import UserList from '../components/UserList';
import UserForm from '../components/UserForm';
import FilterPanel from '../components/FilterPanel';
import type { UserFormData } from '../types/user';

const UsersPage: React.FC = () => {
  const {
    state,
    dispatch,
    createUser,
    updateUser,
    deleteUser,
    openEditForm,
    openCreateForm,
    closeForm,
  } = useUsers();

  const { data, ui, status } = state;

  const handleSubmit = async (formData: UserFormData) => {
    if (data.selectedUser) {
      await updateUser(data.selectedUser.id, formData);
    } else {
      await createUser(formData);
    }
  };

  return (
    <div className="users-page">
      <h1>User Management</h1>

      <FilterPanel
        search={ui.search}
        sortBy={ui.sortBy}
        order={ui.order}
        dispatch={dispatch}
        onAddUser={openCreateForm}
      />

      {status.error && (
        <div className="error-message">{status.error}</div>
      )}

      {status.loading ? (
        <div className="loading-spinner">
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <UserList
            users={data.users}
            onEdit={openEditForm}
            onDelete={deleteUser}
          />

          {data.pagination && (
            <div className="pagination">
              <button
                disabled={ui.page === 1}
                onClick={() => dispatch({ type: 'SET_PAGE', payload: ui.page - 1 })}
              >
                Previous
              </button>
              <span>Page {data.pagination.page} of {data.pagination.totalPages}</span>
              <button
                disabled={ui.page === data.pagination.totalPages}
                onClick={() => dispatch({ type: 'SET_PAGE', payload: ui.page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {ui.isFormOpen && (
        <div className="modal">
          <UserForm
            onSubmit={handleSubmit}
            initialData={data.selectedUser}
            onCancel={closeForm}
          />
        </div>
      )}
    </div>
  );
};

export default UsersPage;

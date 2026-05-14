import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  fetchTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  selectTicket,
  clearError,
} from '../store/ticketsSlice';
import { setPage, openForm, closeForm } from '../store/uiSlice';
import TicketTable from '../components/TicketTable';
import TicketForm from '../components/TicketForm';
import TicketDetails from '../components/TicketDetails';
import FilterPanel from '../components/FilterPanel';
import type { Ticket, TicketFormData } from '../types/ticket';

const TicketsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const tickets = useAppSelector((s) => s.tickets.tickets);
  const selectedTicket = useAppSelector((s) => s.tickets.selectedTicket);
  const pagination = useAppSelector((s) => s.tickets.pagination);
  const loading = useAppSelector((s) => s.tickets.loading);
  const error = useAppSelector((s) => s.tickets.error);
  const isFormOpen = useAppSelector((s) => s.ui.isFormOpen);
  const viewMode = useAppSelector((s) => s.ui.viewMode);
  const page = useAppSelector((s) => s.ui.page);
  const search = useAppSelector((s) => s.ui.search);
  const sortBy = useAppSelector((s) => s.ui.sortBy);
  const order = useAppSelector((s) => s.ui.order);
  const categoryFilter = useAppSelector((s) => s.ui.categoryFilter);
  const statusFilter = useAppSelector((s) => s.ui.statusFilter);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch, page, search, sortBy, order, categoryFilter, statusFilter]);

  const handleView = (ticket: Ticket) => {
    dispatch(selectTicket(ticket));
    dispatch(openForm('view'));
  };

  const handleEdit = (ticket: Ticket) => {
    dispatch(selectTicket(ticket));
    dispatch(openForm('edit'));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Видалити цю заявку?')) {
      dispatch(deleteTicket(id));
    }
  };

  const handleSubmit = (formData: TicketFormData) => {
    if (selectedTicket) {
      dispatch(updateTicket({ id: selectedTicket.id, data: formData }));
    } else {
      dispatch(createTicket(formData));
    }
  };

  const handleCloseForm = () => {
    dispatch(closeForm());
    dispatch(selectTicket(null));
  };

  const handleSwitchToEdit = () => {
    dispatch(openForm('edit'));
  };

  return (
    <div className="users-page">
      <h1>Заявки користувачів</h1>

      <FilterPanel />

      {error && (
        <div className="error-message" onClick={() => dispatch(clearError())}>
          {error} <span className="error-close">✕</span>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <span>Завантаження...</span>
        </div>
      ) : (
        <>
          <TicketTable
            tickets={tickets}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {pagination && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => dispatch(setPage(page - 1))}
              >
                Попередня
              </button>
              <span>Сторінка {pagination.page} з {pagination.totalPages || 1}</span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => dispatch(setPage(page + 1))}
              >
                Наступна
              </button>
            </div>
          )}
        </>
      )}

      {isFormOpen && (
        <div className="modal">
          {viewMode === 'view' && selectedTicket ? (
            <TicketDetails
              ticket={selectedTicket}
              onEdit={handleSwitchToEdit}
              onClose={handleCloseForm}
            />
          ) : (
            <TicketForm
              onSubmit={handleSubmit}
              initialData={selectedTicket}
              onCancel={handleCloseForm}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;

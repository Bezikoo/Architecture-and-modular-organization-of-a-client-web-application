import React from 'react';
import type { Ticket } from '../types/ticket';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types/ticket';

interface TicketTableProps {
  tickets: Ticket[];
  onView: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: number) => void;
}

const TicketTable: React.FC<TicketTableProps> = ({ tickets, onView, onEdit, onDelete }) => {
  if (tickets.length === 0) {
    return <p className="no-data">Заявок не знайдено.</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Тема</th>
            <th>Категорія</th>
            <th>Стан</th>
            <th>Створена</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.subject}</td>
              <td>
                <span className={`category-badge category-${ticket.category}`}>
                  {CATEGORY_LABELS[ticket.category]}
                </span>
              </td>
              <td>
                <span className={`status-badge status-${ticket.status}`}>
                  {STATUS_LABELS[ticket.status]}
                </span>
              </td>
              <td>{new Date(ticket.createdAt).toLocaleDateString('uk-UA')}</td>
              <td>
                <button className="btn-view" onClick={() => onView(ticket)}>Перегляд</button>
                <button className="btn-edit" onClick={() => onEdit(ticket)}>Редагувати</button>
                <button className="btn-delete" onClick={() => onDelete(ticket.id)}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;

import React from 'react';
import type { Ticket } from '../types/ticket';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types/ticket';

interface TicketDetailsProps {
  ticket: Ticket;
  onEdit: () => void;
  onClose: () => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket, onEdit, onClose }) => {
  return (
    <div className="user-form">
      <h3>Заявка №{ticket.id}</h3>
      <div className="ticket-details">
        <p><strong>Тема:</strong> {ticket.subject}</p>
        <p>
          <strong>Категорія:</strong>{' '}
          <span className={`category-badge category-${ticket.category}`}>
            {CATEGORY_LABELS[ticket.category]}
          </span>
        </p>
        <p>
          <strong>Стан розгляду:</strong>{' '}
          <span className={`status-badge status-${ticket.status}`}>
            {STATUS_LABELS[ticket.status]}
          </span>
        </p>
        <p><strong>Дата створення:</strong> {new Date(ticket.createdAt).toLocaleString('uk-UA')}</p>
        <p><strong>Оновлено:</strong> {new Date(ticket.updatedAt).toLocaleString('uk-UA')}</p>
        <div>
          <strong>Опис:</strong>
          <p className="ticket-description">{ticket.description}</p>
        </div>
      </div>
      <div className="form-actions">
        <button onClick={onEdit}>Редагувати</button>
        <button type="button" onClick={onClose}>Закрити</button>
      </div>
    </div>
  );
};

export default TicketDetails;

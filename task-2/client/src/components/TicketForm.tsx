import React, { useState, useEffect } from 'react';
import type { TicketFormData, Ticket, TicketCategory, TicketStatus } from '../types/ticket';
import {
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '../types/ticket';

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => void;
  initialData?: Ticket | null;
  onCancel: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    category: 'general',
    status: 'new',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        subject: initialData.subject,
        category: initialData.category,
        status: initialData.status,
        description: initialData.description,
      });
    } else {
      setFormData({ subject: '', category: 'general', status: 'new', description: '' });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h3>{initialData ? 'Редагувати заявку' : 'Нова заявка'}</h3>
      <div>
        <label>Тема:</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Категорія:</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
        >
          {TICKET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Стан розгляду:</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as TicketStatus })}
        >
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Короткий опис:</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={4}
        />
      </div>
      <div className="form-actions">
        <button type="submit">{initialData ? 'Оновити' : 'Створити'}</button>
        <button type="button" onClick={onCancel}>Скасувати</button>
      </div>
    </form>
  );
};

export default TicketForm;

import React from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  setSearch,
  setSortBy,
  setOrder,
  setCategoryFilter,
  setStatusFilter,
  openForm,
} from '../store/uiSlice';
import { selectTicket } from '../store/ticketsSlice';
import {
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '../types/ticket';

const FilterPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((s) => s.ui.search);
  const sortBy = useAppSelector((s) => s.ui.sortBy);
  const order = useAppSelector((s) => s.ui.order);
  const categoryFilter = useAppSelector((s) => s.ui.categoryFilter);
  const statusFilter = useAppSelector((s) => s.ui.statusFilter);

  const handleAddTicket = () => {
    dispatch(selectTicket(null));
    dispatch(openForm('edit'));
  };

  return (
    <div className="controls">
      <input
        type="text"
        placeholder="Пошук за темою або описом..."
        value={search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
      />
      <select
        value={categoryFilter}
        onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
      >
        <option value="">Всі категорії</option>
        {TICKET_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(e) => dispatch(setStatusFilter(e.target.value))}
      >
        <option value="">Всі стани</option>
        {TICKET_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select value={sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))}>
        <option value="createdAt">Дата створення</option>
        <option value="subject">Тема</option>
        <option value="status">Стан</option>
        <option value="category">Категорія</option>
      </select>
      <select value={order} onChange={(e) => dispatch(setOrder(e.target.value))}>
        <option value="desc">За спаданням</option>
        <option value="asc">За зростанням</option>
      </select>
      <button onClick={handleAddTicket}>Нова заявка</button>
    </div>
  );
};

export default FilterPanel;

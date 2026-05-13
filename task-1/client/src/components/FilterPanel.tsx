import React from 'react';
import type { UsersAction } from '../state/usersReducer';

interface FilterPanelProps {
  search: string;
  sortBy: string;
  order: string;
  dispatch: React.Dispatch<UsersAction>;
  onAddUser: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ search, sortBy, order, dispatch, onAddUser }) => {
  return (
    <div className="controls">
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
      />
      <select
        value={sortBy}
        onChange={(e) => dispatch({ type: 'SET_SORT_BY', payload: e.target.value })}
      >
        <option value="createdAt">Date Created</option>
        <option value="firstName">First Name</option>
        <option value="lastName">Last Name</option>
        <option value="email">Email</option>
      </select>
      <select
        value={order}
        onChange={(e) => dispatch({ type: 'SET_ORDER', payload: e.target.value })}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
      <button onClick={onAddUser}>Add User</button>
    </div>
  );
};

export default FilterPanel;

import React from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { setSearch, setSortBy, setOrder, openForm } from '../store/uiSlice';
import { selectUser } from '../store/usersSlice';

const FilterPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((s) => s.ui.search);
  const sortBy = useAppSelector((s) => s.ui.sortBy);
  const order = useAppSelector((s) => s.ui.order);

  const handleAddUser = () => {
    dispatch(selectUser(null));
    dispatch(openForm());
  };

  return (
    <div className="controls">
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
      />
      <select value={sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))}>
        <option value="createdAt">Date Created</option>
        <option value="firstName">First Name</option>
        <option value="lastName">Last Name</option>
        <option value="email">Email</option>
      </select>
      <select value={order} onChange={(e) => dispatch(setOrder(e.target.value))}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
};

export default FilterPanel;

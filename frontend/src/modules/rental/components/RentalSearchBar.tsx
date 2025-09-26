import React from 'react';
import './RentalSearchBar.css';

interface RentalSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterBy: 'all' | 'available' | 'rented';
  onFilterChange: (filter: 'all' | 'available' | 'rented') => void;
}

export const RentalSearchBar: React.FC<RentalSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  filterBy,
  onFilterChange,
}) => {
  return (
    <div className="rental-search-bar">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search by title, director, or genre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>
      
      <div className="filter-container">
        <label className="filter-label">Filter by:</label>
        <select
          value={filterBy}
          onChange={(e) => onFilterChange(e.target.value as 'all' | 'available' | 'rented')}
          className="filter-select"
        >
          <option value="all">All Films</option>
          <option value="available">Available for Rental</option>
          <option value="rented">Currently Rented</option>
        </select>
      </div>
    </div>
  );
};

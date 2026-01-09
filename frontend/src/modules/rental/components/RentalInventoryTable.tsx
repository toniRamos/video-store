import React, { useState } from 'react';
import { Film } from '../../films/types/Film';
import { InventoryEditModal } from './InventoryEditModal';
import './RentalInventoryTable.css';

interface RentalInventoryTableProps {
  films: Film[];
  onQuantityUpdate: (filmId: string, quantity: number, availabilityQuantity?: number) => void;
  onAvailabilityUpdate: (filmId: string, availabilityQuantity: number) => void;
}

export const RentalInventoryTable: React.FC<RentalInventoryTableProps> = ({
  films,
  onQuantityUpdate,
  onAvailabilityUpdate,
}) => {
  const [editingFilm, setEditingFilm] = useState<Film | null>(null);

  const handleEditClick = (film: Film) => {
    // Only allow editing if film is available
    if (film.available) {
      setEditingFilm(film);
    }
  };

  const handleCloseModal = () => {
    setEditingFilm(null);
  };

  const handleSaveInventory = (quantity: number, availabilityQuantity: number) => {
    if (editingFilm) {
      onQuantityUpdate(editingFilm.id, quantity, availabilityQuantity);
      setEditingFilm(null);
    }
  };

  const getAvailabilityStatus = (film: Film) => {
    if (!film.available) return 'unavailable';
    if (film.availabilityQuantity === 0) return 'out-of-stock';
    if (film.availabilityQuantity <= 2) return 'low-stock';
    return 'in-stock';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unavailable': return '❌';
      case 'out-of-stock': return '📋';
      case 'low-stock': return '⚠️';
      case 'in-stock': return '✅';
      default: return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unavailable': return 'Unavailable';
      case 'out-of-stock': return 'Out of Stock';
      case 'low-stock': return 'Low Stock';
      case 'in-stock': return 'In Stock';
      default: return 'Unknown';
    }
  };

  if (films.length === 0) {
    return (
      <div className="empty-inventory">
        <div className="empty-icon">📦</div>
        <h3>No films found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Film Details</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Availability</th>
              <th>Rented</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {films.map((film) => {
              const status = getAvailabilityStatus(film);
              return (
                <tr key={film.id} className={`inventory-row ${status}`}>
                  <td className="film-details">
                    <div className="film-info">
                      <div className="film-title">{film.title}</div>
                      <div className="film-meta">
                        {film.director} • {film.releaseYear} • {film.genre.join(', ')}
                      </div>
                    </div>
                  </td>
                  
                  <td className="status-cell">
                    <div className={`status-badge ${status}`}>
                      <span className="status-icon">{getStatusIcon(status)}</span>
                      <span className="status-text">{getStatusText(status)}</span>
                    </div>
                  </td>
                  
                  <td className="quantity-cell">
                    <div className="quantity-display">
                      <span className="quantity-number">{film.quantity}</span>
                      <span className="quantity-label">copies</span>
                    </div>
                  </td>
                  
                  <td className="availability-cell">
                    <div className="availability-display">
                      <span className="availability-number">{film.availabilityQuantity}</span>
                      <span className="availability-label">available</span>
                    </div>
                  </td>
                  
                  <td className="rented-cell">
                    <div className="rented-display">
                      <span className="rented-number">{film.rentedQuantity}</span>
                      <span className="rented-label">rented</span>
                    </div>
                  </td>
                  
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEditClick(film)}
                      className={`edit-button ${!film.available ? 'disabled' : ''}`}
                      title={film.available ? "Edit inventory" : "Film is not available for rental"}
                      disabled={!film.available}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingFilm && (
        <InventoryEditModal
          film={editingFilm}
          onSave={handleSaveInventory}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

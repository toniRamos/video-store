import React, { useState, useEffect } from 'react';
import { Film } from '../../films/types/Film';
import './InventoryEditModal.css';

interface InventoryEditModalProps {
  film: Film;
  onSave: (quantity: number, availabilityQuantity: number) => void;
  onClose: () => void;
}

export const InventoryEditModal: React.FC<InventoryEditModalProps> = ({
  film,
  onSave,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(film.quantity);
  const [availabilityQuantity, setAvailabilityQuantity] = useState(film.availabilityQuantity);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setQuantity(film.quantity);
    setAvailabilityQuantity(film.availabilityQuantity);
  }, [film]);

  const validateInputs = (): boolean => {
    const newErrors: string[] = [];

    if (quantity < 0) {
      newErrors.push('Total quantity cannot be negative');
    }

    if (availabilityQuantity < 0) {
      newErrors.push('Available quantity cannot be negative');
    }

    if (availabilityQuantity > quantity) {
      newErrors.push('Available quantity cannot exceed total quantity');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateInputs()) {
      onSave(quantity, availabilityQuantity);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    // Auto-adjust availability if it exceeds new quantity
    if (availabilityQuantity > newQuantity) {
      setAvailabilityQuantity(newQuantity);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const rentedQuantity = quantity - availabilityQuantity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Inventory</h3>
          <button onClick={onClose} className="close-button" aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="film-info">
            <h4>{film.title}</h4>
            <p className="film-subtitle">{film.director} • {film.releaseYear}</p>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Total Copies</label>
            <input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              className="form-input"
            />
            <small className="form-help">Total number of copies in inventory</small>
          </div>

          <div className="form-group">
            <label htmlFor="availabilityQuantity">Available Copies</label>
            <input
              id="availabilityQuantity"
              type="number"
              min="0"
              max={quantity}
              value={availabilityQuantity}
              onChange={(e) => setAvailabilityQuantity(parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              className="form-input"
            />
            <small className="form-help">Copies available for rental</small>
          </div>

          <div className="inventory-summary">
            <div className="summary-item">
              <span className="summary-label">Total:</span>
              <span className="summary-value">{quantity}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Available:</span>
              <span className="summary-value available">{availabilityQuantity}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Rented:</span>
              <span className="summary-value rented">{rentedQuantity}</span>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="error-list">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  ⚠️ {error}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="save-button"
            disabled={errors.length > 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

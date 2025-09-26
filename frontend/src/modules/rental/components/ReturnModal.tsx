import React, { useState } from 'react';
import { rentalService } from '../services/rentalService';
import { Rental, RentalStatus } from '../types/Rental';
import './ReturnModal.css';

interface Props {
  rental: Rental;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnModal: React.FC<Props> = ({ rental, onClose, onSuccess }) => {
  const [returnDate, setReturnDate] = useState(() => {
    // Default to today's date
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDaysRented = () => {
    const start = new Date(rental.rentalDate);
    const end = new Date(returnDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDaysLate = () => {
    const expected = new Date(rental.expectedReturnDate);
    const actualReturn = new Date(returnDate);
    
    if (actualReturn <= expected) return 0;
    
    const diffTime = actualReturn.getTime() - expected.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateLateFee = () => {
    const daysLate = calculateDaysLate();
    if (daysLate <= 0) return 0;
    // $3 per day late fee (you can adjust this)
    return daysLate * 3;
  };

  const getTotalAmountToPay = () => {
    // Customer already paid rental price upfront
    // They only pay late fees if returning late
    return calculateLateFee();
  };

  const isOverdue = () => {
    const expected = new Date(rental.expectedReturnDate);
    const actual = new Date(returnDate);
    return actual > expected;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate return date
    const rentalStart = new Date(rental.rentalDate);
    const returnDateTime = new Date(returnDate);

    if (returnDateTime < rentalStart) {
      setError('Return date cannot be before rental date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await rentalService.returnRental(rental.id, returnDate);
      onSuccess();
    } catch (err) {
      console.error('Error processing return:', err);
      setError(err instanceof Error ? err.message : 'Error processing return');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e && e.target === e.currentTarget) {
      onClose();
    } else if (!e) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content return-modal">
        <div className="modal-header">
          <h2>Process Film Return</h2>
          <button className="close-button" onClick={() => onClose()}>
            ✕
          </button>
        </div>

        <div className="return-form-container">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Rental Information */}
          <div className="rental-info-section">
            <h3>Rental Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Film:</label>
                <span>{rental.filmTitle || `Film ID: ${rental.filmId}`}</span>
              </div>
              <div className="info-item">
                <label>Customer:</label>
                <span>{rental.userName || rental.userId}</span>
              </div>
              <div className="info-item">
                <label>Rental Date:</label>
                <span>{formatDate(rental.rentalDate)}</span>
              </div>
              <div className="info-item">
                <label>Expected Return:</label>
                <span className={isOverdue() ? 'overdue-date' : ''}>
                  {formatDate(rental.expectedReturnDate)}
                </span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status-badge status-${rental.status.toLowerCase()}`}>
                  {rentalService.formatRentalStatus(rental.status)}
                </span>
              </div>
              <div className="info-item">
                <label>Rental Price:</label>
                <span>{formatCurrency(rental.rentalPrice)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="return-form">
            {/* Return Date */}
            <div className="form-group">
              <label htmlFor="returnDate">Return Date:</label>
              <input
                type="date"
                id="returnDate"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={rental.rentalDate.split('T')[0]}
                required
                className="date-input"
              />
            </div>

            {/* Calculation Summary */}
            <div className="calculation-summary">
              <h4>Return Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <label>Original Rental Fee:</label>
                  <span>{formatCurrency(rental.rentalPrice)} ✅ (Already Paid)</span>
                </div>
                
                <div className="summary-item">
                  <label>Days Rented:</label>
                  <span>{calculateDaysRented()} days</span>
                </div>
                
                {isOverdue() && calculateDaysLate() > 0 && (
                  <>
                    <div className="summary-item overdue">
                      <label>Days Overdue:</label>
                      <span>{calculateDaysLate()} days</span>
                    </div>
                    
                    <div className="summary-item overdue">
                      <label>Late Fee ($3/day):</label>
                      <span>{formatCurrency(calculateLateFee())}</span>
                    </div>
                  </>
                )}
                
                <div className="summary-item total">
                  <label><strong>Amount to Pay Today:</strong></label>
                  <span><strong>
                    {getTotalAmountToPay() === 0 ? 'FREE' : formatCurrency(getTotalAmountToPay())}
                  </strong></span>
                </div>
              </div>

              {getTotalAmountToPay() > 0 ? (
                <div className="overdue-warning">
                  ⚠️ This rental is overdue by {calculateDaysLate()} day(s). Customer must pay late fees.
                </div>
              ) : (
                <div className="on-time-message">
                  ✅ Return completed on time! No additional charges.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => onClose()}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className={`submit-button ${isOverdue() ? 'overdue-return' : 'normal-return'}`}
                disabled={loading}
              >
                {loading 
                  ? 'Processing...' 
                  : getTotalAmountToPay() > 0 
                    ? `Return + Pay ${formatCurrency(getTotalAmountToPay())} Late Fee` 
                    : 'Return (No Fee)'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

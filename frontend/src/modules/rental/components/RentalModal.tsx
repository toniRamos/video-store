import React, { useState, useEffect } from 'react';
import { rentalService } from '../services/rentalService';
import { userService } from '../../users/services/userService';
import { filmService } from '../../films/services/filmService';
import { CreateRentalRequest } from '../types/Rental';
import { User } from '../../users/types/User';
import { Film } from '../../films/types/Film';
import './RentalModal.css';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const RentalModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [rentalPeriodDays, setRentalPeriodDays] = useState(3);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filmSearchQuery, setFilmSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [filmResults, setFilmResults] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [eligibilityCheck, setEligibilityCheck] = useState<{
    canRent: boolean;
    reason?: string;
  } | null>(null);

  // Search users
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUserResults([]);
      return;
    }

    try {
      // Get all users and filter locally
      const allUsers = await userService.getAllUsers();
      const filtered = allUsers.filter(user => 
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.personalIdentifier.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setUserResults(filtered);
    } catch (err) {
      console.error('Error searching users:', err);
      setUserResults([]);
    }
  };

  // Search films
  const searchFilms = async (query: string) => {
    if (query.length < 2) {
      setFilmResults([]);
      return;
    }

    try {
      // Get all films and filter locally - usar getAllFilms en lugar de getFilmsAvailableForRental
      const allFilms = await filmService.getAllFilms();
      const availableFilms = allFilms.filter(film => film.isAvailableForRental && film.availabilityQuantity > 0);
      const filtered = availableFilms.filter(film => 
        film.title.toLowerCase().includes(query.toLowerCase()) ||
        film.director.toLowerCase().includes(query.toLowerCase()) ||
        film.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10);
      setFilmResults(filtered);
    } catch (err) {
      console.error('Error searching films:', err);
      setFilmResults([]);
    }
  };

  // Debounced search effects
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchQuery) {
        searchUsers(userSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filmSearchQuery) {
        searchFilms(filmSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filmSearchQuery]);

  // Check eligibility when both user and film are selected
  useEffect(() => {
    const checkEligibility = async () => {
      if (selectedUser && selectedFilm) {
        try {
          const result = await rentalService.checkRentalEligibility(selectedUser.id, selectedFilm.id);
          setEligibilityCheck(result);
        } catch (err) {
          console.error('Error checking eligibility:', err);
          setEligibilityCheck({ canRent: false, reason: 'Error checking eligibility' });
        }
      } else {
        setEligibilityCheck(null);
      }
    };

    checkEligibility();
  }, [selectedUser, selectedFilm]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearchQuery(`${user.firstName} ${user.lastName} (${user.personalIdentifier})`);
    setUserResults([]);
  };

  const handleFilmSelect = (film: Film) => {
    setSelectedFilm(film);
    setFilmSearchQuery(film.title);
    setFilmResults([]);
  };

  const calculateExpectedReturnDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + rentalPeriodDays);
    return date.toLocaleDateString();
  };

  const calculateRentalPrice = () => {
    if (!selectedFilm) return 0;
    // El usuario paga el precio de la película por el período completo
    return selectedFilm.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !selectedFilm) {
      setError('Please select both a user and a film');
      return;
    }

    if (!eligibilityCheck?.canRent) {
      setError(eligibilityCheck?.reason || 'This rental is not allowed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const request: CreateRentalRequest = {
        userId: selectedUser.id,
        filmId: selectedFilm.id,
        rentalPeriodDays
      };

      await rentalService.createRental(request);
      onSuccess();
    } catch (err) {
      console.error('Error creating rental:', err);
      setError(err instanceof Error ? err.message : 'Error creating rental');
    } finally {
      setLoading(false);
    }
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
      <div className="modal-content rental-modal">
        <div className="modal-header">
          <h2>Create New Rental</h2>
          <button className="close-button" onClick={() => onClose()}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rental-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* User Selection */}
          <div className="form-section">
            <h3>Select Customer</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name or personal ID..."
                value={userSearchQuery}
                onChange={(e) => {
                  setUserSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setSelectedUser(null);
                    setUserResults([]);
                  }
                }}
                className="search-input"
              />
              {userResults.length > 0 && (
                <div className="search-results">
                  {userResults.map(user => (
                    <div
                      key={user.id}
                      className="search-result-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="user-info">
                        <span className="user-name">{user.firstName} {user.lastName}</span>
                        <span className="user-details">{user.email} • {user.personalIdentifier}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedUser && (
              <div className="selected-item">
                <strong>Selected Customer:</strong> {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.personalIdentifier})
              </div>
            )}
          </div>

          {/* Film Selection */}
          <div className="form-section">
            <h3>Select Film</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by title, director, or genre..."
                value={filmSearchQuery}
                onChange={(e) => {
                  setFilmSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setSelectedFilm(null);
                    setFilmResults([]);
                  }
                }}
                className="search-input"
              />
              {filmResults.length > 0 && (
                <div className="search-results">
                  {filmResults.map(film => (
                    <div
                      key={film.id}
                      className="search-result-item"
                      onClick={() => handleFilmSelect(film)}
                    >
                      <div className="film-info">
                        <span className="film-title">{film.title}</span>
                        <span className="film-details">
                          {film.director} • {film.genre.join(', ')} • ${film.price}/day
                        </span>
                        <span className="film-availability">
                          Available: {film.availabilityQuantity} copies
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedFilm && (
              <div className="selected-item">
                <strong>Selected Film:</strong> {selectedFilm.title} - ${selectedFilm.price}/day
                <br />
                <small>Available copies: {selectedFilm.availabilityQuantity}</small>
              </div>
            )}
          </div>

          {/* Rental Info */}
          {selectedFilm && (
            <div className="form-section">
              <div className="rental-info-box">
                <p><strong>📅 Return by:</strong> {calculateExpectedReturnDate()} (3 days)</p>
                <p><strong>💰 Price:</strong> ${calculateRentalPrice().toFixed(2)}</p>
                <p><small>💡 <em>Free for 3 days. Late fees ($3/day) apply after return date.</em></small></p>
              </div>
            </div>
          )}

          {/* Eligibility Check */}
          {eligibilityCheck && (
            <div className={`eligibility-check ${eligibilityCheck.canRent ? 'eligible' : 'not-eligible'}`}>
              {eligibilityCheck.canRent ? (
                <span className="eligible-message">✓ Rental approved</span>
              ) : (
                <span className="not-eligible-message">✗ {eligibilityCheck.reason}</span>
              )}
            </div>
          )}

          {/* Submit Buttons */}
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
              className="submit-button"
              disabled={loading || !selectedUser || !selectedFilm || !eligibilityCheck?.canRent}
            >
              {loading 
                ? 'Creating Rental...' 
                : selectedFilm 
                  ? `Rent for $${calculateRentalPrice().toFixed(2)}` 
                  : 'Create Rental'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

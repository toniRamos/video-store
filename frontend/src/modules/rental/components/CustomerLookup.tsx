import React, { useState } from 'react';
import { userService } from '../../users/services/userService';
import { rentalService } from '../services/rentalService';
import { filmService } from '../../films/services/filmService';
import { User } from '../../users/types/User';
import { Rental, RentalStatus } from '../types/Rental';
import { Film } from '../../films/types/Film';
import { ReturnModal } from './ReturnModal';
import './CustomerLookup.css';

export const CustomerLookup: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'id' | 'phone'>('name');
  const [customer, setCustomer] = useState<User | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const searchCustomer = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setCustomer(null);
    setRentals([]);

    try {
      // Get all users and search locally (you could also create a backend search endpoint)
      const users = await userService.getAllUsers();
      let foundUser: User | null = null;

      switch (searchType) {
        case 'name':
          foundUser = users.find(user => 
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
          ) || null;
          break;
        case 'id':
          foundUser = users.find(user => 
            user.personalIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
          ) || null;
          break;
        case 'phone':
          foundUser = users.find(user => 
            user.phone.includes(searchTerm)
          ) || null;
          break;
      }

      if (!foundUser) {
        setError('Customer not found');
        return;
      }

      setCustomer(foundUser);

      // Get customer's rental history
      const customerRentalsResponse = await rentalService.getUserRentals(foundUser.id);
      const customerRentals = customerRentalsResponse.rentals || [];
      
      // Get film details for all rentals
      const filmList = await filmService.getAllFilms();
      setFilms(filmList);

      // Populate rental data with film names
      const populatedRentals = customerRentals.map((rental: Rental) => ({
        ...rental,
        filmTitle: filmList.find(f => f.id === rental.filmId)?.title || `Film ID: ${rental.filmId}`
      }));

      setRentals(populatedRentals);
    } catch (err) {
      console.error('Search error:', err);
      setError('Error searching for customer');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (rental: Rental) => {
    setSelectedRental(rental);
    setShowReturnModal(true);
  };

  const handleReturnSuccess = () => {
    setShowReturnModal(false);
    setSelectedRental(null);
    // Refresh the customer's rentals
    if (customer) {
      searchCustomer();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: RentalStatus) => {
    const badgeClass = status === RentalStatus.ACTIVE ? 'status-active' : 'status-returned';
    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  const isOverdue = (rental: Rental) => {
    if (rental.status === RentalStatus.RETURNED) return false;
    return new Date() > new Date(rental.expectedReturnDate);
  };

  const activeRentals = rentals.filter(r => r.status === RentalStatus.ACTIVE);
  const returnedRentals = rentals.filter(r => r.status === RentalStatus.RETURNED);

  return (
    <div className="customer-lookup">
      <div className="lookup-header">
        <h2>👤 Customer Lookup</h2>
        <p>Search for a customer to view their rental history and process returns</p>
      </div>

      {/* Search Form */}
      <div className="search-section">
        <div className="search-controls">
          <div className="search-type">
            <label>Search by:</label>
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value as 'name' | 'id' | 'phone')}
            >
              <option value="name">Name</option>
              <option value="id">DNI/NIE</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          
          <div className="search-input">
            <input
              type="text"
              placeholder={`Enter customer ${searchType === 'name' ? 'name' : searchType === 'id' ? 'DNI/NIE' : 'phone number'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
            />
            <button onClick={searchCustomer} disabled={loading || !searchTerm.trim()}>
              {loading ? '🔍 Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">❌ {error}</div>}
      </div>

      {/* Customer Info */}
      {customer && (
        <div className="customer-info">
          <h3>📋 Customer Information</h3>
          <div className="customer-details">
            <div className="info-grid">
              <div className="info-item">
                <strong>Name:</strong> {customer.firstName} {customer.lastName}
              </div>
              <div className="info-item">
                <strong>DNI/NIE:</strong> {customer.personalIdentifier}
              </div>
              <div className="info-item">
                <strong>Phone:</strong> {customer.phone}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {customer.email}
              </div>
              <div className="info-item">
                <strong>Membership:</strong> {customer.membershipType?.toUpperCase() || 'STANDARD'}
              </div>
              <div className="info-item">
                <strong>Member since:</strong> {formatDate(customer.registrationDate)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rental History */}
      {customer && (
        <div className="rental-history">
          <div className="history-summary">
            <h3>🎬 Rental History</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">{activeRentals.length}</span>
                <span className="stat-label">Active Rentals</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{returnedRentals.length}</span>
                <span className="stat-label">Returned</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{activeRentals.filter(isOverdue).length}</span>
                <span className="stat-label overdue">Overdue</span>
              </div>
            </div>
          </div>

          {/* Active Rentals */}
          {activeRentals.length > 0 && (
            <div className="rental-section">
              <h4>🔴 Active Rentals ({activeRentals.length})</h4>
              <div className="rentals-table">
                <table>
                  <thead>
                    <tr>
                      <th>Film</th>
                      <th>Rented</th>
                      <th>Due Date</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRentals.map(rental => (
                      <tr key={rental.id} className={isOverdue(rental) ? 'overdue-row' : ''}>
                        <td>
                          <strong>{(rental as any).filmTitle}</strong>
                        </td>
                        <td>{formatDate(rental.rentalDate)}</td>
                        <td>
                          {formatDate(rental.expectedReturnDate)}
                          {isOverdue(rental) && <span className="overdue-badge">⚠️ OVERDUE</span>}
                        </td>
                        <td>{formatCurrency(rental.rentalPrice)}</td>
                        <td>{getStatusBadge(rental.status)}</td>
                        <td>
                          <button 
                            className="return-btn"
                            onClick={() => handleReturnClick(rental)}
                          >
                            📥 Return
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Returns */}
          {returnedRentals.length > 0 && (
            <div className="rental-section">
              <h4>✅ Recent Returns ({returnedRentals.slice(-5).length} of {returnedRentals.length})</h4>
              <div className="rentals-table">
                <table>
                  <thead>
                    <tr>
                      <th>Film</th>
                      <th>Rented</th>
                      <th>Returned</th>
                      <th>Price</th>
                      <th>Late Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedRentals.slice(-5).reverse().map(rental => (
                      <tr key={rental.id}>
                        <td><strong>{(rental as any).filmTitle}</strong></td>
                        <td>{formatDate(rental.rentalDate)}</td>
                        <td>{rental.actualReturnDate ? formatDate(rental.actualReturnDate) : '-'}</td>
                        <td>{formatCurrency(rental.rentalPrice)}</td>
                        <td>{formatCurrency(rental.lateFee || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {rentals.length === 0 && (
            <div className="no-rentals">
              <p>📝 This customer has no rental history.</p>
            </div>
          )}
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedRental && (
        <ReturnModal
          rental={selectedRental}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedRental(null);
          }}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
};

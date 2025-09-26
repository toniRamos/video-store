import React, { useState, useEffect } from 'react';
import { rentalService } from '../services/rentalService';
import { RentalAnalytics, Rental, RentalStatus } from '../types/Rental';
import { RentalModal } from './RentalModal';
// import { SimpleRentalModal } from './SimpleRentalModal';
import { ReturnModal } from './ReturnModal';
import { userService } from '../../users/services/userService';
import { filmService } from '../../films/services/filmService';
import { User } from '../../users/types/User';
import { Film } from '../../films/types/Film';
import './RentalDashboard.css';

interface Props {
  // Podemos recibir props para filtros iniciales si es necesario
}

export const RentalDashboard: React.FC<Props> = () => {
  const [analytics, setAnalytics] = useState<RentalAnalytics | null>(null);
  const [overdueRentals, setOverdueRentals] = useState<Rental[]>([]);
  const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  // Función para poblar nombres de usuarios y películas en los rentals
  const populateRentalData = (rentals: Rental[], users: User[], films: Film[]): Rental[] => {
    // Create maps for efficient lookup
    const userMap = new Map(users.map(user => [user.id, user]));
    const filmMap = new Map(films.map(film => [film.id, film]));

    return rentals.map(rental => ({
      ...rental,
      // Replace filmId with human-readable film name
      filmId: filmMap.get(rental.filmId)?.title || rental.filmId,
      // Replace userId with human-readable customer name and personal identifier
      userId: userMap.get(rental.userId) 
        ? `${userMap.get(rental.userId)!.firstName} ${userMap.get(rental.userId)!.lastName} (${userMap.get(rental.userId)!.personalIdentifier})`
        : rental.userId
    }));
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar datos con manejo robusto de errores
      const [analyticsResult, overdueResult, recentResult, usersResult, filmsResult] = await Promise.allSettled([
        rentalService.getAnalytics(),
        rentalService.getOverdueRentals(),
        rentalService.searchRentals({ limit: 10, offset: 0 }),
        userService.getAllUsers(),
        filmService.getAllFilms()
      ]);

      // Manejar analytics con valores por defecto
      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value);
      } else {
        console.error('Analytics error:', analyticsResult.reason);
        // Establecer analytics por defecto
        setAnalytics({
          totalRentals: 0,
          activeRentals: 0,
          overdueRentals: 0,
          totalRevenue: 0,
          averageRentalDays: 0,
          totalLateFees: 0,
          topFilms: [],
          topUsers: []
        });
      }

      // Obtener datos de usuarios y películas para población de nombres
      const users = usersResult.status === 'fulfilled' ? usersResult.value || [] : [];
      const films = filmsResult.status === 'fulfilled' ? filmsResult.value || [] : [];

      // Manejar rentals vencidos
      if (overdueResult.status === 'fulfilled') {
        const overdueList = overdueResult.value || [];
        const populatedOverdue = populateRentalData(overdueList, users, films);
        setOverdueRentals(populatedOverdue);
      } else {
        console.error('Overdue rentals error:', overdueResult.reason);
        setOverdueRentals([]);
      }

      // Manejar rentals recientes
      if (recentResult.status === 'fulfilled') {
        const rentals = recentResult.value?.rentals || [];
        // Poblar nombres de usuarios y películas
        const populatedRentals = populateRentalData(rentals, users, films);
        setRecentRentals(populatedRentals);
      } else {
        console.error('Recent rentals error:', recentResult.reason);
        setRecentRentals([]);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
      
      // Establecer valores por defecto en caso de error
      setAnalytics({
        totalRentals: 0,
        activeRentals: 0,
        overdueRentals: 0,
        totalRevenue: 0,
        averageRentalDays: 0,
        totalLateFees: 0,
        topFilms: [],
        topUsers: []
      });
      setOverdueRentals([]);
      setRecentRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRentalSuccess = () => {
    setShowRentalModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReturnSuccess = () => {
    setShowReturnModal(false);
    setSelectedRental(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const openReturnModal = (rental: Rental) => {
    setSelectedRental(rental);
    setShowReturnModal(true);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(safeAmount);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const safeNumber = (value: number | undefined | null) => {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  const getStatusBadgeClass = (status: RentalStatus) => {
    switch (status) {
      case RentalStatus.ACTIVE:
        return 'status-badge status-active';
      case RentalStatus.OVERDUE:
        return 'status-badge status-overdue';
      case RentalStatus.RETURNED:
        return 'status-badge status-returned';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="rental-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading rental dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rental-dashboard">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rental-dashboard">
      <div className="dashboard-header">
        <h1>Rental Dashboard</h1>
        <div className="dashboard-actions">
          <button
            onClick={() => setShowRentalModal(true)}
            className="primary-button"
          >
            + New Rental
          </button>
          <button
            onClick={loadDashboardData}
            className="secondary-button"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      {analytics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Rentals</h3>
            <div className="metric-value">{safeNumber(analytics?.totalRentals).toLocaleString()}</div>
          </div>
          
          <div className="metric-card active">
            <h3>Active Rentals</h3>
            <div className="metric-value">{safeNumber(analytics?.activeRentals).toLocaleString()}</div>
          </div>
          
          <div className="metric-card overdue">
            <h3>Overdue Rentals</h3>
            <div className="metric-value">{safeNumber(analytics?.overdueRentals).toLocaleString()}</div>
          </div>
          
          <div className="metric-card revenue">
            <h3>Total Revenue</h3>
            <div className="metric-value">{formatCurrency(analytics?.totalRevenue)}</div>
          </div>

          <div className="metric-card">
            <h3>Avg Rental Days</h3>
            <div className="metric-value">{safeNumber(analytics?.averageRentalDays).toFixed(1)}</div>
          </div>

          <div className="metric-card">
            <h3>Late Fees</h3>
            <div className="metric-value">{formatCurrency(analytics?.totalLateFees)}</div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* Rentals vencidos */}
        {overdueRentals && overdueRentals.length > 0 && (
          <div className="dashboard-section overdue-section">
            <div className="section-header">
              <h2>⚠️ Overdue Rentals ({overdueRentals.length})</h2>
            </div>
            <div className="rentals-list">
              {(overdueRentals || []).map(rental => (
                <div key={rental.id} className="rental-card overdue-card">
                  <div className="rental-info">
                    <h4>🎬 {rental.filmTitle || `Film ID: ${rental.filmId}`}</h4>
                    <p><strong>👤 Customer:</strong> {rental.userName ? `${rental.userName} (${rental.userId})` : rental.userId}</p>
                    <p><strong>Expected Return:</strong> {formatDate(rental.expectedReturnDate)}</p>
                    <p><strong>Days Overdue:</strong> {
                      Math.ceil((new Date().getTime() - new Date(rental.expectedReturnDate).getTime()) / (1000 * 60 * 60 * 24))
                    }</p>
                    {rental.lateFee && rental.lateFee > 0 && (
                      <p><strong>Late Fee:</strong> {formatCurrency(rental.lateFee)}</p>
                    )}
                  </div>
                  <div className="rental-actions">
                    <button
                      onClick={() => openReturnModal(rental)}
                      className="primary-button small"
                    >
                      Process Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rentals recientes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Rentals</h2>
            <button className="text-button">View All</button>
          </div>
          <div className="rentals-list">
            {(recentRentals || []).map(rental => (
              <div key={rental.id} className="rental-card">
                <div className="rental-info">
                  <h4>🎬 {rental.filmTitle || `Film ID: ${rental.filmId}`}</h4>
                  <p><strong>👤 Customer:</strong> {rental.userName ? `${rental.userName} (${rental.userId})` : rental.userId}</p>
                  <p><strong>Rental Date:</strong> {formatDate(rental.rentalDate)}</p>
                  <p><strong>Expected Return:</strong> {formatDate(rental.expectedReturnDate)}</p>
                  {rental.actualReturnDate && (
                    <p><strong>Returned:</strong> {formatDate(rental.actualReturnDate)}</p>
                  )}
                </div>
                <div className="rental-status">
                  <span className={getStatusBadgeClass(rental.status)}>
                    {rentalService.formatRentalStatus(rental.status)}
                  </span>
                  {rental.status === RentalStatus.ACTIVE && !rentalService.isOverdue(rental.expectedReturnDate) && (
                    <button
                      onClick={() => openReturnModal(rental)}
                      className="secondary-button small"
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top films por rentals */}
        {analytics?.topFilms && analytics.topFilms.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Most Rented Films</h2>
            </div>
            <div className="top-items-list">
              {(analytics?.topFilms || []).map((film, index) => (
                <div key={film.filmId} className="top-item">
                  <span className="rank">#{index + 1}</span>
                  <div className="item-info">
                    <h4>{film.filmTitle || `Film ID: ${film.filmId}`}</h4>
                    <p>{film.rentalCount} rentals</p>
                  </div>
                  <div className="item-revenue">
                    {formatCurrency(film.totalRevenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top usuarios */}
        {analytics?.topUsers && analytics.topUsers.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Top Customers</h2>
            </div>
            <div className="top-items-list">
              {(analytics?.topUsers || []).map((user, index) => (
                <div key={user.userId} className="top-item">
                  <span className="rank">#{index + 1}</span>
                  <div className="item-info">
                    <h4>{user.userName || `User ID: ${user.userId}`}</h4>
                    <p>{user.rentalCount} rentals</p>
                  </div>
                  <div className="item-revenue">
                    {formatCurrency(user.totalSpent)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showRentalModal && (
        <RentalModal
          onClose={() => setShowRentalModal(false)}
          onSuccess={handleRentalSuccess}
        />
      )}

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

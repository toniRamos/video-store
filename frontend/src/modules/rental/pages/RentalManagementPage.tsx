import React, { useState, useEffect } from 'react';
import { Film } from '../../films/types/Film';
import { filmService } from '../../films/services/filmService';
import { RentalInventoryTable } from '../components/RentalInventoryTable';
import { RentalSearchBar } from '../components/RentalSearchBar';
import { RentalDashboard } from '../components/RentalDashboard';
// import { SimpleRentalDashboard } from '../components/SimpleRentalDashboard';
import { useToast } from '../../shared/hooks/useToast';
import './RentalManagementPage.css';

type TabType = 'dashboard' | 'inventory';

export const RentalManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [films, setFilms] = useState<Film[]>([]);
  const [filteredFilms, setFilteredFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'available' | 'rented'>('all');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadFilms();
  }, []);

  useEffect(() => {
    filterFilms();
  }, [films, searchTerm, filterBy]);

  const loadFilms = async () => {
    try {
      setLoading(true);
      const filmsData = await filmService.getAllFilms();
      setFilms(filmsData);
    } catch (error) {
      showError('Error loading films');
      console.error('Error loading films:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFilms = () => {
    let filtered = films;

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(film =>
        film.title.toLowerCase().includes(term) ||
        film.director.toLowerCase().includes(term) ||
        film.genre.toLowerCase().includes(term)
      );
    }

    // Apply availability filter
    switch (filterBy) {
      case 'available':
        filtered = filtered.filter(film => film.isAvailableForRental);
        break;
      case 'rented':
        filtered = filtered.filter(film => film.rentedQuantity > 0);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredFilms(filtered);
  };

  const handleQuantityUpdate = async (filmId: string, quantity: number, availabilityQuantity?: number) => {
    try {
      const updatedFilm = await filmService.updateFilmQuantity(filmId, quantity, availabilityQuantity);
      setFilms(prevFilms =>
        prevFilms.map(film => film.id === filmId ? updatedFilm : film)
      );
      showSuccess('Inventory updated successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error updating inventory');
    }
  };

  const handleAvailabilityUpdate = async (filmId: string, availabilityQuantity: number) => {
    try {
      const updatedFilm = await filmService.updateFilmAvailabilityQuantity(filmId, availabilityQuantity);
      setFilms(prevFilms =>
        prevFilms.map(film => film.id === filmId ? updatedFilm : film)
      );
      showSuccess('Availability updated successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error updating availability');
    }
  };

  const handleRefresh = () => {
    loadFilms();
  };

  if (loading) {
    return (
      <div className="rental-management-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rental-management-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Rental Management</h1>
          <p className="header-subtitle">
            Manage rentals, returns, and inventory
          </p>
        </div>
        <div className="header-tabs">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Inventory
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <RentalDashboard />
      )}

      {activeTab === 'inventory' && (
        <>
          <div className="management-controls">
            <RentalSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterBy={filterBy}
              onFilterChange={setFilterBy}
            />
            
            <div className="stats-summary">
              <div className="stat-card">
                <span className="stat-number">{films.length}</span>
                <span className="stat-label">Total Films</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {films.filter(f => f.isAvailableForRental).length}
                </span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {films.reduce((sum, f) => sum + f.rentedQuantity, 0)}
                </span>
                <span className="stat-label">Rented Copies</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {films.reduce((sum, f) => sum + f.quantity, 0)}
                </span>
                <span className="stat-label">Total Copies</span>
              </div>
              <button onClick={handleRefresh} className="refresh-button">
                <span className="refresh-icon">🔄</span>
                Refresh
              </button>
            </div>
          </div>

          <div className="inventory-container">
            <RentalInventoryTable
              films={filteredFilms}
              onQuantityUpdate={handleQuantityUpdate}
              onAvailabilityUpdate={handleAvailabilityUpdate}
            />
          </div>
        </>
      )}
    </div>
  );
};

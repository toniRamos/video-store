import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film } from '../types/Film';
import { filmService } from '../services/filmService';
import './FilmList.css';

const FilmList: React.FC = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFilms();
  }, [filter]);

  const loadFilms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let filmsData: Film[];
      if (filter === 'available') {
        filmsData = await filmService.getAvailableFilms();
      } else {
        filmsData = await filmService.getAllFilms();
        if (filter === 'unavailable') {
          filmsData = filmsData.filter(film => !film.available);
        }
      }
      
      setFilms(filmsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load films');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (film: Film) => {
    try {
      await filmService.toggleFilmAvailability(film.id);
      loadFilms(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle availability');
    }
  };

  const handleDeleteFilm = async (film: Film) => {
    if (window.confirm(`Are you sure you want to delete "${film.title}"?`)) {
      try {
        await filmService.deleteFilm(film.id);
        loadFilms(); // Reload the list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete film');
      }
    }
  };

  const filteredFilms = films.filter(film =>
    film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    film.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
    film.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="loading">Loading films...</div>;
  }

  return (
    <div className="film-list">
      <div className="film-list-header">
        <h1>Video Store Films</h1>
        <Link to="/films/create" className="btn btn-primary">
          Add New Film
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadFilms} className="btn btn-small">
            Retry
          </button>
        </div>
      )}

      <div className="film-list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search films..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-active' : 'btn-secondary'}`}
          >
            All Films ({films.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`btn ${filter === 'available' ? 'btn-active' : 'btn-secondary'}`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            className={`btn ${filter === 'unavailable' ? 'btn-active' : 'btn-secondary'}`}
          >
            Unavailable
          </button>
        </div>
      </div>

      {filteredFilms.length === 0 ? (
        <div className="no-films">
          <h3>No films found</h3>
          <p>
            {searchTerm
              ? `No films match your search for "${searchTerm}"`
              : 'No films available. Add some films to get started!'}
          </p>
          <Link to="/films/create" className="btn btn-primary">
            Add Your First Film
          </Link>
        </div>
      ) : (
        <div className="films-grid">
          {filteredFilms.map((film) => (
            <div key={film.id} className="film-card">
              <div className="film-card-header">
                <h3 className="film-title">{film.title}</h3>
                <span className={`availability-badge ${film.available ? 'available' : 'unavailable'}`}>
                  {film.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <div className="film-info">
                <p><strong>Director:</strong> {film.director}</p>
                <p><strong>Year:</strong> {film.releaseYear}</p>
                <p><strong>Genre:</strong></p>
                <div className="genre-tags">
                  {film.genre.map((g, idx) => (
                    <span key={idx} className="genre-tag">{g}</span>
                  ))}
                </div>
                <p><strong>Duration:</strong> {film.duration} min</p>
                <p><strong>Price:</strong> ${film.price.toFixed(2)}</p>
              </div>
              
              <div className="film-description">
                <p>{film.description}</p>
              </div>
              
              <div className="film-actions">
                <Link to={`/films/${film.id}`} className="btn btn-secondary">
                  View Details
                </Link>
                <button
                  onClick={() => handleToggleAvailability(film)}
                  className={`btn ${film.available ? 'btn-warning' : 'btn-success'}`}
                >
                  {film.available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button
                  onClick={() => handleDeleteFilm(film)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilmList;

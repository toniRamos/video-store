import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Film } from '../types/Film';
import { filmService } from '../services/filmService';
import './FilmDetail.css';

const FilmDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadFilm(id);
    }
  }, [id]);

  const loadFilm = async (filmId: string) => {
    try {
      setLoading(true);
      setError(null);
      const filmData = await filmService.getFilmById(filmId);
      setFilm(filmData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load film');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!film) return;
    
    try {
      const updatedFilm = await filmService.toggleFilmAvailability(film.id);
      setFilm(updatedFilm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle availability');
    }
  };

  const handleDeleteFilm = async () => {
    if (!film) return;
    
    if (window.confirm(`Are you sure you want to delete "${film.title}"?`)) {
      try {
        await filmService.deleteFilm(film.id);
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete film');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading film details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          {error}
        </div>
        <Link to="/" className="btn btn-primary">
          Back to Films
        </Link>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="error-container">
        <div className="error-message">
          Film not found
        </div>
        <Link to="/" className="btn btn-primary">
          Back to Films
        </Link>
      </div>
    );
  }

  return (
    <div className="film-detail">
      <div className="film-detail-header">
        <Link to="/" className="btn btn-secondary">
          ← Back to Films
        </Link>
        <div className="film-actions">
          <Link to={`/films/${film.id}/edit`} className="btn btn-primary">
            Edit Film
          </Link>
          <button
            onClick={handleToggleAvailability}
            className={`btn ${film.available ? 'btn-warning' : 'btn-success'}`}
          >
            {film.available ? 'Mark Unavailable' : 'Mark Available'}
          </button>
          <button
            onClick={handleDeleteFilm}
            className="btn btn-danger"
          >
            Delete Film
          </button>
        </div>
      </div>

      <div className="film-detail-content">
        <div className="film-main-info">
          <div className="film-title-section">
            <h1>{film.title}</h1>
            <span className={`availability-badge large ${film.available ? 'available' : 'unavailable'}`}>
              {film.available ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <div className="film-meta">
            <div className="meta-row">
              <span className="meta-label">Director:</span>
              <span className="meta-value">{film.director}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Release Year:</span>
              <span className="meta-value">{film.releaseYear}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Genre:</span>
              <div className="meta-value genre-badges">
                {film.genre.map((g, idx) => (
                  <span key={idx} className="genre-badge">{g}</span>
                ))}
              </div>
            </div>
            <div className="meta-row">
              <span className="meta-label">Duration:</span>
              <span className="meta-value">{film.duration} minutes</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Rental Price:</span>
              <span className="meta-value price">${film.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="film-description">
          <h3>Description</h3>
          <p>{film.description}</p>
        </div>

        <div className="film-dates">
          <div className="date-info">
            <span className="date-label">Added:</span>
            <span className="date-value">
              {new Date(film.createdAt).toLocaleDateString()} at{' '}
              {new Date(film.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="date-info">
            <span className="date-label">Last Updated:</span>
            <span className="date-value">
              {new Date(film.updatedAt).toLocaleDateString()} at{' '}
              {new Date(film.updatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default FilmDetail;

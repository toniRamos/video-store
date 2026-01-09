import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CreateFilmRequest, Film } from '../types/Film';
import { filmService } from '../services/filmService';
import DuplicateWarning from './DuplicateWarning';
import LiveDuplicateWarning from './LiveDuplicateWarning';
import Toast from '../../shared/components/Toast';
import { useToast } from '../../shared/hooks/useToast';
import { useDebounce } from '../../shared/hooks/useDebounce';
import './FilmForm.css';

interface FilmFormProps {
  isEdit?: boolean;
}

const FilmForm: React.FC<FilmFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<CreateFilmRequest>({
    title: '',
    director: '',
    releaseYear: new Date().getFullYear(),
    genre: [],
    duration: 0,
    description: '',
    price: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [duplicates, setDuplicates] = useState<Film[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [liveWarning, setLiveWarning] = useState<Film[]>([]);
  const [showLiveWarning, setShowLiveWarning] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadFilm(id);
    }
  }, [isEdit, id]);

  const loadFilm = async (filmId: string) => {
    try {
      setInitialLoading(true);
      const film = await filmService.getFilmById(filmId);
      setFormData({
        title: film.title,
        director: film.director,
        releaseYear: film.releaseYear,
        genre: film.genre,
        duration: film.duration,
        description: film.description,
        price: film.price,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load film');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      let newValue = type === 'number' 
        ? parseFloat(value) || 0
        : type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked
          : value;

      return { ...prev, [name]: newValue };
    });
  };

  const checkForDuplicates = useCallback(async (title: string, director: string, releaseYear: number) => {
    if (!title.trim() || !director.trim() || !releaseYear) {
      return [];
    }

    try {
      setCheckingDuplicates(true);
      const duplicates = await filmService.checkPotentialDuplicates(title, director, releaseYear);
      
      // Filter out current film if editing
      const filteredDuplicates = isEdit && id 
        ? duplicates.filter(film => film.id !== id)
        : duplicates;
        
      return filteredDuplicates;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return [];
    } finally {
      setCheckingDuplicates(false);
    }
  }, [isEdit, id]);

  // Live duplicate checking with debounce
  const checkLiveDuplicates = useCallback(async (title: string, director: string, releaseYear: number) => {
    if (!title.trim() || !director.trim() || !releaseYear || isEdit) {
      setLiveWarning([]);
      setShowLiveWarning(false);
      return;
    }

    try {
      const duplicates = await filmService.checkPotentialDuplicates(title, director, releaseYear);
      setLiveWarning(duplicates);
      setShowLiveWarning(duplicates.length > 0);
    } catch (error) {
      console.error('Error checking live duplicates:', error);
      setLiveWarning([]);
      setShowLiveWarning(false);
    }
  }, [isEdit]);

  const debouncedLiveCheck = useDebounce(checkLiveDuplicates, 1000);

  // Effect to trigger live duplicate checking when key fields change
  useEffect(() => {
    debouncedLiveCheck(formData.title, formData.director, formData.releaseYear);
  }, [formData.title, formData.director, formData.releaseYear, debouncedLiveCheck]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Title is required');
    }
    if (!formData.director.trim()) {
      throw new Error('Director is required');
    }
    if (!formData.genre || formData.genre.length === 0) {
      throw new Error('At least one genre is required');
    }
    if (formData.genre.length > 5) {
      throw new Error('Maximum 5 genres allowed');
    }
    if (formData.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    if (formData.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (formData.releaseYear < 1895 || formData.releaseYear > new Date().getFullYear() + 5) {
      throw new Error('Release year must be between 1895 and 5 years in the future');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      validateForm();

      if (isEdit && id) {
        // For editing, just update the film
        await filmService.updateFilm(id, formData);
        showSuccess('Film updated successfully!');
        setTimeout(() => navigate(`/films/${id}`), 1000);
      } else {
        // For creating, check for duplicates first
        const foundDuplicates = await checkForDuplicates(
          formData.title,
          formData.director,
          formData.releaseYear
        );

        if (foundDuplicates.length > 0) {
          setDuplicates(foundDuplicates);
          setShowDuplicateWarning(true);
          setLoading(false);
          return;
        }

        // No duplicates found, create normally
        const newFilm = await filmService.createFilm(formData);
        showSuccess('Film created successfully!');
        setTimeout(() => navigate(`/films/${newFilm.id}`), 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save film';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnyway = async () => {
    setLoading(true);
    try {
      const newFilm = await filmService.createFilm(formData);
      showSuccess('Film created successfully despite potential duplicates!');
      setTimeout(() => navigate(`/films/${newFilm.id}`), 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create film';
      setError(errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
    setShowDuplicateWarning(false);
  };

  const handleUpsert = async () => {
    setLoading(true);
    try {
      const result = await filmService.upsertFilm(formData);
      const message = result.wasCreated 
        ? 'New film created successfully!' 
        : 'Existing film updated successfully!';
      showSuccess(message);
      setTimeout(() => navigate(`/films/${result.film.id}`), 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update film';
      setError(errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
    setShowDuplicateWarning(false);
  };

  const handleCancelWarning = () => {
    setShowDuplicateWarning(false);
    setDuplicates([]);
    setLoading(false);
  };

  if (initialLoading) {
    return <div className="loading">Loading film data...</div>;
  }

  return (
    <div className="film-form">
      <div className="film-form-header">
        <Link to={isEdit && id ? `/films/${id}` : '/'} className="btn btn-secondary">
          ← Back
        </Link>
        <h1>{isEdit ? 'Edit Film' : 'Add New Film'}</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="film-form-content">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter film title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="director">Director *</label>
            <input
              type="text"
              id="director"
              name="director"
              value={formData.director}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter director name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="releaseYear">Release Year *</label>
            <input
              type="number"
              id="releaseYear"
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleInputChange}
              required
              min="1895"
              max={new Date().getFullYear() + 5}
              className="form-input"
            />
          </div>

          <div className="form-group full-width">
            <label>Genres * (select 1-5)</label>
            <div className="genre-checkboxes">
              {['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation', 'Family', 'Musical', 'Western', 'War', 'Biography', 'History', 'Sport'].map((genre) => (
                <label key={genre} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.genre.includes(genre)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (formData.genre.length < 5) {
                          setFormData(prev => ({
                            ...prev,
                            genre: [...prev.genre, genre]
                          }));
                        }
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          genre: prev.genre.filter(g => g !== genre)
                        }));
                      }
                    }}
                    disabled={!formData.genre.includes(genre) && formData.genre.length >= 5}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
            <small className="form-hint">
              Selected: {formData.genre.length} / 5 {formData.genre.length > 0 && `(${formData.genre.join(', ')})`}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes) *</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              min="1"
              className="form-input"
              placeholder="Enter duration in minutes"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Rental Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="form-input"
              placeholder="Enter rental price"
            />
          </div>
        </div>

        <LiveDuplicateWarning 
          duplicates={liveWarning}
          visible={showLiveWarning && !isEdit}
        />

        <div className="form-group full-width">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="form-textarea"
            placeholder="Enter film description"
          />
        </div>



        <div className="form-actions">
          <Link 
            to={isEdit && id ? `/films/${id}` : '/'} 
            className="btn btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || checkingDuplicates}
            className="btn btn-primary"
          >
            {checkingDuplicates 
              ? 'Checking duplicates...' 
              : loading 
                ? 'Saving...' 
                : (isEdit ? 'Update Film' : 'Create Film')
            }
          </button>
        </div>
      </form>

      {showDuplicateWarning && (
        <DuplicateWarning
          duplicates={duplicates}
          onContinue={handleCreateAnyway}
          onCancel={handleCancelWarning}
          onUseUpsert={handleUpsert}
          loading={loading}
        />
      )}

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default FilmForm;

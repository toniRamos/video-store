import React from 'react';
import { Film } from '../types/Film';
import './DuplicateWarning.css';

interface DuplicateWarningProps {
  duplicates: Film[];
  onContinue: () => void;
  onCancel: () => void;
  onUseUpsert: () => void;
  loading?: boolean;
}

const DuplicateWarning: React.FC<DuplicateWarningProps> = ({
  duplicates,
  onContinue,
  onCancel,
  onUseUpsert,
  loading = false
}) => {
  if (duplicates.length === 0) return null;

  return (
    <div className="duplicate-warning-overlay">
      <div className="duplicate-warning-modal">
        <div className="duplicate-warning-header">
          <h3>⚠️ Potential Duplicate Detected</h3>
        </div>
        
        <div className="duplicate-warning-content">
          <p>We found <strong>{duplicates.length}</strong> existing film{duplicates.length > 1 ? 's' : ''} that might be similar to <strong>"{duplicates[0]?.title}"</strong>:</p>
          
          <div className="duplicate-films-list">
            {duplicates.map((film) => (
              <div key={film.id} className="duplicate-film-card">
                <div className="film-info">
                  <h4>{film.title}</h4>
                  <p><strong>Director:</strong> {film.director}</p>
                  <p><strong>Year:</strong> {film.releaseYear}</p>
                  <p><strong>Genre:</strong> {film.genre}</p>
                  <p><strong>Price:</strong> ${film.price}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="warning-message">
            <p><strong>What would you like to do?</strong></p>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#92400e' }}>
              <li><strong>Update Existing:</strong> Replace the existing film with your new data</li>
              <li><strong>Create Anyway:</strong> Create a new film even if it might be duplicate</li>
              <li><strong>Cancel:</strong> Go back and modify your data</li>
            </ul>
          </div>
        </div>
        
        <div className="duplicate-warning-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="button"
            className="btn btn-warning"
            onClick={onUseUpsert}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Existing'}
          </button>
          
          <button
            type="button"
            className="btn btn-primary"
            onClick={onContinue}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Anyway'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarning;

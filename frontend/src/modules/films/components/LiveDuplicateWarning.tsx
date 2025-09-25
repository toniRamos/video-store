import React from 'react';
import { Film } from '../types/Film';
import './LiveDuplicateWarning.css';

interface LiveDuplicateWarningProps {
  duplicates: Film[];
  visible: boolean;
}

const LiveDuplicateWarning: React.FC<LiveDuplicateWarningProps> = ({ duplicates, visible }) => {
  if (!visible || duplicates.length === 0) return null;

  return (
    <div className="live-duplicate-warning">
      <div className="live-warning-content">
        <span className="warning-icon">⚠️</span>
        <div className="warning-text">
          <strong>Potential duplicate found:</strong> {duplicates[0].title} ({duplicates[0].releaseYear}) by {duplicates[0].director}
          {duplicates.length > 1 && <span> and {duplicates.length - 1} more</span>}
        </div>
      </div>
    </div>
  );
};

export default LiveDuplicateWarning;

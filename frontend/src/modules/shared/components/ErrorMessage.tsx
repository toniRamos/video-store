import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  onDismiss 
}) => {
  return (
    <div className="error-message-container">
      <div className="error-content">
        <span className="error-icon">❌</span>
        <p className="error-text">{message}</p>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            Try Again
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="btn btn-secondary">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

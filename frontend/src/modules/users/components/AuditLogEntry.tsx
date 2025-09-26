import React from 'react';
import { AuditLogEntry as AuditEntry, FieldChange } from '../services/auditService';
import './AuditLogEntry.css';

interface AuditLogEntryProps {
  entry: AuditEntry;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

const AuditLogEntry: React.FC<AuditLogEntryProps> = ({ 
  entry, 
  showDetails = false, 
  onToggleDetails 
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'green';
      case 'UPDATE':
        return 'blue';
      case 'DELETE':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US'),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getValueDisplay = (change: FieldChange) => {
    const { oldValue, newValue, dataType } = change;

    if (dataType === 'boolean') {
      return {
        old: oldValue === 'N/A' ? 'N/A' : (oldValue === 'true' || oldValue === 'Yes') ? 'Yes' : 'No',
        new: (newValue === 'true' || newValue === 'Yes') ? 'Yes' : 'No'
      };
    }

    return {
      old: oldValue || 'N/A',
      new: newValue || 'N/A'
    };
  };

  const { date, time } = formatTimestamp(entry.timestamp);

  return (
    <div className="audit-log-entry">
      <div className="audit-header" onClick={onToggleDetails}>
        <div className="audit-action">
          <span 
            className="action-icon" 
            style={{ color: getActionColor(entry.action) }}
          >
            {getActionIcon(entry.action)}
          </span>
          <div className="action-content">
            <span className="action-text">{entry.changesSummary}</span>
            {entry.userName && (
              <span className="affected-user">
                👤 {entry.userName}
                {entry.userDni && <span className="user-dni"> ({entry.userDni})</span>}
              </span>
            )}
          </div>
        </div>
        
        <div className="audit-meta">
          <span className="audit-date">{date}</span>
          <span className="audit-time">{time}</span>
          {onToggleDetails && (
            <button className="toggle-details-btn">
              {showDetails ? '🔼' : '🔽'}
            </button>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="audit-details">
          {entry.changes.length > 0 ? (
            <div className="changes-list">
              <h4>Changes made:</h4>
              {entry.changes.map((change, index) => {
                const values = getValueDisplay(change);
                return (
                  <div key={index} className="field-change">
                    <div className="field-name">
                      <strong>{change.field}</strong>
                    </div>
                    <div className="value-change">
                      {change.oldValue !== 'N/A' ? (
                        <>
                          <span className="old-value">"{values.old}"</span>
                          <span className="arrow">→</span>
                          <span className="new-value">"{values.new}"</span>
                        </>
                      ) : (
                        <span className="new-value">Set to: "{values.new}"</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-changes">
              No specific changes recorded.
            </div>
          )}

          {entry.metadata && (
            <div className="audit-metadata">
              <h4>Additional information:</h4>
              {entry.metadata.userAgent && (
                <div className="metadata-item">
                  <strong>Browser:</strong> {entry.metadata.userAgent}
                </div>
              )}
              {entry.metadata.ipAddress && (
                <div className="metadata-item">
                  <strong>IP Address:</strong> {entry.metadata.ipAddress}
                </div>
              )}
              {entry.metadata.performedBy && (
                <div className="metadata-item">
                  <strong>Performed by:</strong> {entry.metadata.performedBy}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogEntry;

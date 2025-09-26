import React, { useState, useEffect } from 'react';
import { auditService, AuditLogEntry as AuditEntry, HistorySummaryResponse } from '../services/auditService';
import { useApi } from '../../shared';
import AuditLogEntry from './AuditLogEntry';
import './UserHistoryViewer.css';

interface UserHistoryViewerProps {
  userId: string;
  userName: string;
}

const UserHistoryViewer: React.FC<UserHistoryViewerProps> = ({ userId, userName }) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState<HistorySummaryResponse['data'] | null>(null);
  const itemsPerPage = 10;

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    execute: fetchHistory
  } = useApi(() => auditService.getUserHistory(userId, itemsPerPage, (currentPage - 1) * itemsPerPage));

  const {
    loading: summaryLoading,
    execute: fetchSummary
  } = useApi(() => auditService.getHistorySummary(userId));

  useEffect(() => {
    fetchHistory();
    fetchSummary().then(response => {
      if (response && response.data) {
        setSummary(response.data);
      }
    });
  }, [currentPage, userId]);

  const toggleEntryDetails = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedEntries(new Set()); // Close all expanded entries when changing page
  };

  const totalPages = historyData ? Math.ceil(historyData.data.totalCount / itemsPerPage) : 0;

  if (historyLoading || summaryLoading) {
    return (
      <div className="history-viewer">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="history-viewer">
        <div className="error-state">
          <h3>❌ Error loading history</h3>
          <p>{historyError}</p>
          <button onClick={() => fetchHistory()} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!historyData || historyData.data.history.length === 0) {
    return (
      <div className="history-viewer">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No History</h3>
          <p>No changes recorded for {userName}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-viewer">
      <div className="history-header">
        <div className="header-title">
          <h2>📋 History of {userName}</h2>
          <p>Complete record of all changes made</p>
        </div>

        {summary && (
          <div className="history-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">{summary.totalEvents}</span>
                <span className="stat-label">Total events</span>
              </div>
              <div className="stat-item create">
                <span className="stat-number">{summary.actionCounts.CREATE}</span>
                <span className="stat-label">Creations</span>
              </div>
              <div className="stat-item update">
                <span className="stat-number">{summary.actionCounts.UPDATE}</span>
                <span className="stat-label">Modifications</span>
              </div>
              <div className="stat-item delete">
                <span className="stat-number">{summary.actionCounts.DELETE}</span>
                <span className="stat-label">Deletions</span>
              </div>
            </div>

            {summary.lastActivity && (
              <div className="last-activity">
                <strong>Última actividad:</strong> {summary.lastActivity.changesSummary}
                <span className="activity-date">
                  {new Date(summary.lastActivity.timestamp).toLocaleString('es-ES')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="history-content">
        <div className="entries-list">
          {historyData.data.history.map((entry) => (
            <AuditLogEntry
              key={entry.id}
              entry={entry}
              showDetails={expandedEntries.has(entry.id)}
              onToggleDetails={() => toggleEntryDetails(entry.id)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn prev"
            >
              ← Previous
            </button>
            
            <div className="pagination-info">
              <span>Page {currentPage} of {totalPages}</span>
              <span className="showing-info">
                Showing {historyData.data.history.length} of {historyData.data.totalCount} events
              </span>
            </div>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn next"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div className="history-actions">
        <button 
          onClick={() => {
            fetchHistory();
            fetchSummary();
          }}
          className="refresh-btn"
        >
          🔄 Refresh
        </button>
        
        <button 
          onClick={() => setExpandedEntries(new Set())}
          className="collapse-all-btn"
        >
          📝 Collapse all
        </button>
        
        <button 
          onClick={() => {
            const allIds = new Set(historyData.data.history.map(entry => entry.id));
            setExpandedEntries(allIds);
          }}
          className="expand-all-btn"
        >
          📖 Expand all
        </button>
      </div>
    </div>
  );
};

export default UserHistoryViewer;

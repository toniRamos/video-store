import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { auditService, AuditLogEntry as AuditEntry } from '../services/auditService';
import { useApi } from '../../shared';
import AuditLogEntry from '../components/AuditLogEntry';
import './UserHistoryPage.css';

interface UserSummary {
  userId: string;
  userName: string;
  userDni?: string;
  eventCount: number;
  lastActivity: string;
}

const UserHistoryPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([]);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    execute: fetchHistory
  } = useApi(() => 
    selectedUser 
      ? auditService.getUserHistory(selectedUser, itemsPerPage, (currentPage - 1) * itemsPerPage)
      : auditService.getGlobalHistory(itemsPerPage, (currentPage - 1) * itemsPerPage)
  );

  const {
    loading: summaryLoading,
    execute: fetchSummary
  } = useApi(() => auditService.getGlobalHistorySummary());

  useEffect(() => {
    fetchHistory();
    if (!selectedUser) {
      fetchSummary().then(response => {
        if (response && response.data && response.data.userSummaries) {
          setUserSummaries(response.data.userSummaries);
        }
      });
    }
  }, [currentPage, selectedUser]);

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
    setExpandedEntries(new Set());
  };

  const handleUserFilter = (userId: string) => {
    setSelectedUser(userId);
    setCurrentPage(1);
    setExpandedEntries(new Set());
  };

  const clearUserFilter = () => {
    setSelectedUser('');
    setCurrentPage(1);
    setExpandedEntries(new Set());
  };

  const totalPages = historyData ? Math.ceil(historyData.data.totalCount / itemsPerPage) : 0;
  const selectedUserSummary = userSummaries.find(u => u.userId === selectedUser);
  const selectedUserName = selectedUserSummary 
    ? `${selectedUserSummary.userName}${selectedUserSummary.userDni ? ` (${selectedUserSummary.userDni})` : ''}`
    : 'User';

  if (historyLoading || summaryLoading) {
    return (
      <div className="history-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading complete history...</p>
        </div>
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="history-page">


      <div className="history-filters">
        <div className="user-filter-section">
          <h3>🔍 Filter by User</h3>
          <div className="user-filter-controls">
            {selectedUser ? (
              <div className="selected-user">
                <span>Showing history for: <strong>{selectedUserName}</strong></span>
                <button onClick={clearUserFilter} className="clear-filter-btn">
                  ✕ Show all
                </button>
              </div>
            ) : (
              <div className="user-filter-grid">
                {userSummaries.map(user => (
                  <div 
                    key={user.userId}
                    className="user-summary-card"
                    onClick={() => handleUserFilter(user.userId)}
                  >
                    <div className="user-name">
                      {user.userName}
                      {user.userDni && <span className="user-dni"> ({user.userDni})</span>}
                    </div>
                    <div className="user-stats">
                      <span className="event-count">{user.eventCount} events</span>
                      <span className="last-activity">
                        Last: {new Date(user.lastActivity).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="history-content">
        {historyError ? (
          <div className="error-state">
            <h3>❌ Error loading history</h3>
            <p>{historyError}</p>
            <button onClick={() => fetchHistory()} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        ) : !historyData || historyData.data.history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No History</h3>
            <p>
              {selectedUser 
                ? `No changes recorded for ${selectedUserName}.`
                : 'No changes recorded in the system.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="history-info">
              <div className="info-stats">
                <span className="total-events">
                  📊 Showing {historyData.data.history.length} of {historyData.data.totalCount} events
                </span>
                {selectedUser && (
                  <span className="filtered-info">
                    🔍 Filtered by: {selectedUserName}
                  </span>
                )}
              </div>
            </div>

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
          </>
        )}
      </div>

      <div className="history-actions">
        <button 
          onClick={() => {
            fetchHistory();
            if (!selectedUser) {
              fetchSummary().then(response => {
                if (response && response.data && response.data.userSummaries) {
                  setUserSummaries(response.data.userSummaries);
                }
              });
            }
          }}
          className="refresh-btn"
        >
          🔄 Refresh
        </button>
        
        {historyData && historyData.data.history.length > 0 && (
          <>
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
          </>
        )}
      </div>
      </div>
    </UserLayout>
  );
};

export default UserHistoryPage;

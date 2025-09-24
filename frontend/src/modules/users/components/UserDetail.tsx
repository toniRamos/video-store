import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { User } from '../types/User';
import { userService } from '../services/userService';
import UserHistoryViewer from './UserHistoryViewer';
import './UserDetail.css';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      const updatedUser = await userService.updateUserStatus(user.id, !user.active);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.fullName}"? This action cannot be undone.`
    );

    if (confirmDelete) {
      try {
        await userService.deleteUser(user.id);
        navigate('/users');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMembershipBadgeClass = (membershipType: string) => {
    switch (membershipType) {
      case 'premium': return 'membership-premium';
      case 'vip': return 'membership-vip';
      default: return 'membership-standard';
    }
  };

  if (loading) {
    return (
      <div className="user-detail">
        <div className="loading">Loading user details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-detail">
        <div className="error-message">
          <p>❌ {error}</p>
          <div className="error-actions">
            <button onClick={() => id && loadUser(id)} className="btn btn-primary">
              Try Again
            </button>
            <Link to="/users" className="btn btn-secondary">
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-detail">
        <div className="not-found">
          <h2>User Not Found</h2>
          <p>The requested user could not be found.</p>
          <Link to="/users" className="btn btn-primary">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-detail">
      <div className="user-detail-header">
        <div className="header-content">
          <h1 className="user-name">{user.fullName}</h1>
          <div className="status-badges">
            <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
              {user.active ? '✅ Active' : '❌ Inactive'}
            </span>
            <span className={`membership-badge ${getMembershipBadgeClass(user.membershipType)}`}>
              {user.membershipType.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-info history-btn"
            title="Ver historial de cambios"
          >
            📋 {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
          </button>
          <Link to="/users" className="btn btn-secondary">
            ← Back to Users
          </Link>
          <Link to={`/users/${user.id}/edit`} className="btn btn-warning">
            ✏️ Edit
          </Link>
        </div>
      </div>

      {showHistory && (
        <div className="history-modal-overlay">
          <div className="history-modal">
            <div className="history-modal-header">
              <h2>📋 Historial de {user.fullName}</h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="close-history-btn"
                title="Cerrar historial"
              >
                ✕
              </button>
            </div>
            <div className="history-modal-content">
              <UserHistoryViewer userId={user.id} userName={user.fullName} />
            </div>
          </div>
        </div>
      )}

      <div className="user-detail-content">
        <div className="detail-grid">
          <div className="detail-section">
            <h3>📋 Personal Information</h3>
            <div className="detail-items">
              <div className="detail-item">
                <span className="label">Personal ID:</span>
                <span className="value">{user.personalIdentifier}</span>
              </div>
              <div className="detail-item">
                <span className="label">First Name:</span>
                <span className="value">{user.firstName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Last Name:</span>
                <span className="value">{user.lastName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Date of Birth:</span>
                <span className="value">{formatDate(user.dateOfBirth)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Age:</span>
                <span className="value">{user.age} years</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>📞 Contact Information</h3>
            <div className="detail-items">
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">
                  <a href={`mailto:${user.email}`} className="email-link">
                    {user.email}
                  </a>
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">
                  <a href={`tel:${user.phone}`} className="phone-link">
                    {user.phone}
                  </a>
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Address:</span>
                <span className="value">{user.address}</span>
              </div>
              <div className="detail-item">
                <span className="label">City:</span>
                <span className="value">{user.city}</span>
              </div>
              <div className="detail-item">
                <span className="label">Postal Code:</span>
                <span className="value">{user.postalCode}</span>
              </div>
              <div className="detail-item">
                <span className="label">Country:</span>
                <span className="value">{user.country}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>🎯 Account Information</h3>
            <div className="detail-items">
              <div className="detail-item">
                <span className="label">Membership Type:</span>
                <span className={`value membership-text ${getMembershipBadgeClass(user.membershipType)}`}>
                  {user.membershipType.charAt(0).toUpperCase() + user.membershipType.slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Account Status:</span>
                <span className={`value ${user.active ? 'text-success' : 'text-danger'}`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Registration Date:</span>
                <span className="value">{formatDate(user.registrationDate)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>🕒 System Information</h3>
            <div className="detail-items">
              <div className="detail-item">
                <span className="label">User ID:</span>
                <span className="value code">{user.id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Created At:</span>
                <span className="value">{formatDateTime(user.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Last Updated:</span>
                <span className="value">{formatDateTime(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="action-section">
          <h3>🛠️ Actions</h3>
          <div className="action-buttons">
            <button
              onClick={handleToggleStatus}
              className={`btn ${user.active ? 'btn-warning' : 'btn-success'}`}
            >
              {user.active ? '❌ Deactivate User' : '✅ Activate User'}
            </button>
            <Link to={`/users/${user.id}/edit`} className="btn btn-info">
              ✏️ Edit User
            </Link>
            <button onClick={handleDeleteUser} className="btn btn-danger">
              🗑️ Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;

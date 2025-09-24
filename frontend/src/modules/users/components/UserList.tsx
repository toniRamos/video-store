import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types/User';
import { userService } from '../services/userService';
import './UserList.css';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'standard' | 'premium' | 'vip'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filter, membershipFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let usersData: User[];
      
      // Apply status filter
      if (filter === 'active') {
        usersData = await userService.getActiveUsers();
      } else if (filter === 'inactive') {
        usersData = await userService.getInactiveUsers();
      } else {
        usersData = await userService.getAllUsers();
      }

      // Apply membership filter
      if (membershipFilter !== 'all') {
        usersData = usersData.filter(user => user.membershipType === membershipFilter);
      }
      
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.updateUserStatus(user.id, !user.active);
      loadUsers(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.fullName}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        await userService.deleteUser(user.id);
        loadUsers(); // Reload the list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.personalIdentifier.toLowerCase().includes(searchLower) ||
      user.city.toLowerCase().includes(searchLower) ||
      user.phone.includes(searchTerm)
    );
  });

  const getMembershipBadgeClass = (membershipType: string) => {
    switch (membershipType) {
      case 'premium': return 'membership-premium';
      case 'vip': return 'membership-vip';
      default: return 'membership-standard';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="user-list">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-list">
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={loadUsers} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      )}

      <div className="user-list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name, email, ID, city, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
          </select>

          <select
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value as 'all' | 'standard' | 'premium' | 'vip')}
            className="filter-select"
          >
            <option value="all">All Memberships</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      <div className="user-list-stats">
        <p>Showing {filteredUsers.length} of {users.length} users</p>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-users">
          <p>No users found.</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-secondary"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="user-grid">
          {filteredUsers.map((user) => (
            <div key={user.id} className={`user-card ${!user.active ? 'inactive' : ''}`}>
              <div className="user-card-header">
                <h3 className="user-name">
                  <Link to={`/users/${user.id}`} className="user-link">
                    {user.fullName}
                  </Link>
                </h3>
                <span className={`membership-badge ${getMembershipBadgeClass(user.membershipType)}`}>
                  {user.membershipType.toUpperCase()}
                </span>
              </div>

              <div className="user-info">
                <p><strong>ID:</strong> {user.personalIdentifier}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Location:</strong> {user.city}, {user.country}</p>
                <p><strong>Age:</strong> {user.age} years</p>
                <p><strong>Member since:</strong> {formatDate(user.registrationDate)}</p>
              </div>

              <div className="user-status">
                <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                  {user.active ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>

              <div className="user-actions">
                <Link
                  to={`/users/${user.id}`}
                  className="btn btn-info btn-sm"
                >
                  View Details
                </Link>
                <Link
                  to={`/users/${user.id}/edit`}
                  className="btn btn-warning btn-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleToggleStatus(user)}
                  className={`btn btn-sm ${user.active ? 'btn-secondary' : 'btn-success'}`}
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="btn btn-danger btn-sm"
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

export default UserList;

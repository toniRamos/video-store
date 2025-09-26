import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './UserNavigation.css';

const UserNavigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/users' && location.pathname === '/users') {
      return true;
    }
    if (path !== '/users' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="user-navigation">
      <div className="user-nav-header">
        <h2 className="user-nav-title">👥 User Management</h2>
        <p className="user-nav-subtitle">Manage users and view their activity history</p>
      </div>
      
      <nav className="user-nav-menu">
        <Link 
          to="/users" 
          className={`user-nav-link ${isActive('/users') ? 'active' : ''}`}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">User List</span>
          <span className="nav-description">View and manage all users</span>
        </Link>
        
        <Link 
          to="/users/create" 
          className={`user-nav-link ${isActive('/users/create') ? 'active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-text">Create User</span>
          <span className="nav-description">Register a new user</span>
        </Link>
        
        <Link 
          to="/users/history" 
          className={`user-nav-link ${isActive('/users/history') ? 'active' : ''}`}
        >
          <span className="nav-icon">📚</span>
          <span className="nav-text">Global History</span>
          <span className="nav-description">Audit trail of all changes</span>
        </Link>
      </nav>
    </div>
  );
};

export default UserNavigation;

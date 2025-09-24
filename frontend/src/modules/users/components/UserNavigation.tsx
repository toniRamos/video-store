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
        <h2 className="user-nav-title">👥 Gestión de Usuarios</h2>
        <p className="user-nav-subtitle">Administra usuarios y consulta su historial de actividad</p>
      </div>
      
      <nav className="user-nav-menu">
        <Link 
          to="/users" 
          className={`user-nav-link ${isActive('/users') ? 'active' : ''}`}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">Lista de Usuarios</span>
          <span className="nav-description">Ver y administrar todos los usuarios</span>
        </Link>
        
        <Link 
          to="/users/create" 
          className={`user-nav-link ${isActive('/users/create') ? 'active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-text">Crear Usuario</span>
          <span className="nav-description">Registrar un nuevo usuario</span>
        </Link>
        
        <Link 
          to="/users/history" 
          className={`user-nav-link ${isActive('/users/history') ? 'active' : ''}`}
        >
          <span className="nav-icon">📚</span>
          <span className="nav-text">Historial Global</span>
          <span className="nav-description">Auditoría de todos los cambios</span>
        </Link>
      </nav>
    </div>
  );
};

export default UserNavigation;

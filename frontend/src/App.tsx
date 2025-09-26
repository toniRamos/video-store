import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  HomePage,
  FilmDetailPage,
  CreateFilmPage,
  EditFilmPage 
} from './modules/films';
import { 
  UsersHomePage,
  UserDetailPage,
  CreateUserPage,
  EditUserPage,
  UserHistoryPage
} from './modules/users';
import { RentalManagementPage } from './modules/rental/pages/RentalManagementPage';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <h1 className="app-title">🎬 Video Store</h1>
            <p className="app-subtitle">Manage your film collection and users</p>
            <nav className="app-nav">
              <Link to="/" className="nav-link">🎬 Films</Link>
              <Link to="/users" className="nav-link">👥 Users</Link>
              <Link to="/rental" className="nav-link">📦 Rental</Link>
            </nav>
          </div>
        </header>
        
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/films/create" element={<CreateFilmPage />} />
              <Route path="/films/:id" element={<FilmDetailPage />} />
              <Route path="/films/:id/edit" element={<EditFilmPage />} />
              <Route path="/users" element={<UsersHomePage />} />
              <Route path="/users/create" element={<CreateUserPage />} />
              <Route path="/users/history" element={<UserHistoryPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />
              <Route path="/users/:id/edit" element={<EditUserPage />} />
              <Route path="/rental" element={<RentalManagementPage />} />
            </Routes>
          </div>
        </main>
        
        <footer className="app-footer">
          <div className="container">
            <p>&copy; 2025 Video Store. Built with React & TypeScript.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;

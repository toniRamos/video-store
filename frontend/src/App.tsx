import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FilmDetailPage from './pages/FilmDetailPage';
import CreateFilmPage from './pages/CreateFilmPage';
import EditFilmPage from './pages/EditFilmPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <h1 className="app-title">🎬 Video Store</h1>
            <p className="app-subtitle">Manage your film collection</p>
          </div>
        </header>
        
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/films/create" element={<CreateFilmPage />} />
              <Route path="/films/:id" element={<FilmDetailPage />} />
              <Route path="/films/:id/edit" element={<EditFilmPage />} />
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

// Films module exports
export { default as FilmList } from './components/FilmList';
export { default as FilmForm } from './components/FilmForm';
export { default as FilmDetail } from './components/FilmDetail';

export { default as HomePage } from './pages/HomePage';
export { default as CreateFilmPage } from './pages/CreateFilmPage';
export { default as EditFilmPage } from './pages/EditFilmPage';
export { default as FilmDetailPage } from './pages/FilmDetailPage';

export { filmService } from './services/filmService';

export type {
  Film,
  CreateFilmRequest,
  UpdateFilmRequest
} from './types/Film';

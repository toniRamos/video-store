import { Film } from '../entities/Film';

export interface FilmRepository {
  save(film: Film): Promise<Film>;
  findById(id: string): Promise<Film | null>;
  findAll(): Promise<Film[]>;
  findByTitle(title: string): Promise<Film[]>;
  findByGenre(genre: string): Promise<Film[]>;
  findByDirector(director: string): Promise<Film[]>;
  findByAvailability(available: boolean): Promise<Film[]>;
  update(film: Film): Promise<Film>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

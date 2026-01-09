import { Film } from '../entities/Film';

export interface FilmRepository {
  save(film: Film): Promise<Film>;
  upsert(film: Film): Promise<{ film: Film; wasCreated: boolean }>;
  findById(id: string): Promise<Film | null>;
  findAll(): Promise<Film[]>;
  findByTitle(title: string): Promise<Film[]>;
  findByGenre(genre: string | string[]): Promise<Film[]>;
  findByDirector(director: string): Promise<Film[]>;
  findByAvailability(available: boolean): Promise<Film[]>;
  findPotentialDuplicates(title: string, director: string, releaseYear: number): Promise<Film[]>;
  update(film: Film): Promise<Film>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

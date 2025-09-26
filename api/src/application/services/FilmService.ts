import { Film } from '../../domain/entities/Film';
import { FilmRepository } from '../../domain/repositories/FilmRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateFilmRequest {
  title: string;
  director: string;
  releaseYear: number;
  genre: string;
  duration: number;
  description: string;
  price: number;
}

export interface UpdateFilmRequest {
  title?: string;
  director?: string;
  releaseYear?: number;
  genre?: string;
  duration?: number;
  description?: string;
  price?: number;
}

export class FilmService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async createFilm(request: CreateFilmRequest): Promise<Film> {
    const id = uuidv4();
    
    // Set default values for inventory management
    // New films start with 1 copy, available, and 1 copy available for rental
    const film = Film.create(
      id,
      request.title,
      request.director,
      request.releaseYear,
      request.genre,
      request.duration,
      request.description,
      request.price,
      true, // available by default
      1,    // 1 copy by default
      1     // 1 copy available by default
    );

    return await this.filmRepository.save(film);
  }

  async upsertFilm(request: CreateFilmRequest): Promise<{ film: Film; wasCreated: boolean }> {
    const id = uuidv4();
    
    // Set default values for inventory management
    // New films start with 1 copy, available, and 1 copy available for rental
    const film = Film.create(
      id,
      request.title,
      request.director,
      request.releaseYear,
      request.genre,
      request.duration,
      request.description,
      request.price,
      true, // available by default
      1,    // 1 copy by default
      1     // 1 copy available by default
    );

    return await this.filmRepository.upsert(film);
  }

  async findPotentialDuplicates(title: string, director: string, releaseYear: number): Promise<Film[]> {
    if (!title || !director || !releaseYear) {
      throw new Error('Title, director and release year are required');
    }
    
    return await this.filmRepository.findPotentialDuplicates(title, director, releaseYear);
  }

  async getFilmById(id: string): Promise<Film | null> {
    if (!id) {
      throw new Error('Film ID is required');
    }
    
    return await this.filmRepository.findById(id);
  }

  async getAllFilms(): Promise<Film[]> {
    return await this.filmRepository.findAll();
  }

  async getFilmsByTitle(title: string): Promise<Film[]> {
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }
    
    return await this.filmRepository.findByTitle(title);
  }

  async getFilmsByGenre(genre: string): Promise<Film[]> {
    if (!genre || genre.trim().length === 0) {
      throw new Error('Genre is required');
    }
    
    return await this.filmRepository.findByGenre(genre);
  }

  async getFilmsByDirector(director: string): Promise<Film[]> {
    if (!director || director.trim().length === 0) {
      throw new Error('Director is required');
    }
    
    return await this.filmRepository.findByDirector(director);
  }

  async getAvailableFilms(): Promise<Film[]> {
    return await this.filmRepository.findByAvailability(true);
  }

  async updateFilm(id: string, request: UpdateFilmRequest): Promise<Film> {
    if (!id) {
      throw new Error('Film ID is required');
    }

    const existingFilm = await this.filmRepository.findById(id);
    if (!existingFilm) {
      throw new Error('Film not found');
    }

    // Create updated film with new values (inventory fields remain unchanged)
    const updatedFilm = new Film(
      existingFilm.id,
      request.title ?? existingFilm.title,
      request.director ?? existingFilm.director,
      request.releaseYear ?? existingFilm.releaseYear,
      request.genre ?? existingFilm.genre,
      request.duration ?? existingFilm.duration,
      request.description ?? existingFilm.description,
      existingFilm.available, // Keep existing availability status
      request.price ?? existingFilm.price,
      existingFilm.quantity, // Keep existing quantity
      existingFilm.availabilityQuantity, // Keep existing availability quantity
      existingFilm.createdAt,
      new Date()
    );

    return await this.filmRepository.update(updatedFilm);
  }

  async deleteFilm(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Film ID is required');
    }

    const exists = await this.filmRepository.exists(id);
    if (!exists) {
      throw new Error('Film not found');
    }

    return await this.filmRepository.delete(id);
  }

  async toggleFilmAvailability(id: string): Promise<Film> {
    const film = await this.getFilmById(id);
    if (!film) {
      throw new Error('Film not found');
    }

    const updatedFilm = film.updateAvailability(!film.available);
    return await this.filmRepository.update(updatedFilm);
  }

  async updateFilmPrice(id: string, newPrice: number): Promise<Film> {
    const film = await this.getFilmById(id);
    if (!film) {
      throw new Error('Film not found');
    }

    const updatedFilm = film.updatePrice(newPrice);
    return await this.filmRepository.update(updatedFilm);
  }

  /**
   * Update the total quantity of copies for a film
   */
  async updateFilmQuantity(id: string, quantity: number, availabilityQuantity?: number): Promise<Film> {
    const film = await this.getFilmById(id);
    if (!film) {
      throw new Error('Film not found');
    }

    const updatedFilm = film.updateQuantity(quantity, availabilityQuantity);
    return await this.filmRepository.update(updatedFilm);
  }

  /**
   * Update the availability quantity (copies available for rental)
   */
  async updateFilmAvailabilityQuantity(id: string, availabilityQuantity: number): Promise<Film> {
    const film = await this.getFilmById(id);
    if (!film) {
      throw new Error('Film not found');
    }

    const updatedFilm = film.updateAvailabilityQuantity(availabilityQuantity);
    return await this.filmRepository.update(updatedFilm);
  }

  /**
   * Get all films that are available for rental (have copies available)
   */
  async getFilmsAvailableForRental(): Promise<Film[]> {
    const allFilms = await this.getAllFilms();
    return allFilms.filter(film => film.isAvailableForRental());
  }

  /**
   * Check if a film has copies available for rental
   */
  async isFilmAvailableForRental(id: string): Promise<boolean> {
    const film = await this.getFilmById(id);
    if (!film) {
      return false;
    }
    return film.isAvailableForRental();
  }
}

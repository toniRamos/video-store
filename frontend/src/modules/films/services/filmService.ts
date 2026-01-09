import { Film, CreateFilmRequest, UpdateFilmRequest } from '../types/Film';
import { ApiResponse } from '../../shared/types';

class FilmService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error');
    }
  }

  async getAllFilms(): Promise<Film[]> {
    const response = await this.request<Film[]>('/api/films');
    return response.data || [];
  }

  async getFilmById(id: string): Promise<Film> {
    const response = await this.request<Film>(`/api/films/${id}`);
    if (!response.data) {
      throw new Error('Film not found');
    }
    return response.data;
  }

  async createFilm(filmData: CreateFilmRequest): Promise<Film> {
    const response = await this.request<Film>('/api/films', {
      method: 'POST',
      body: JSON.stringify(filmData),
    });
    if (!response.data) {
      throw new Error('Failed to create film');
    }
    return response.data;
  }

  async updateFilm(id: string, filmData: UpdateFilmRequest): Promise<Film> {
    const response = await this.request<Film>(`/api/films/${id}`, {
      method: 'PUT',
      body: JSON.stringify(filmData),
    });
    if (!response.data) {
      throw new Error('Failed to update film');
    }
    return response.data;
  }

  async deleteFilm(id: string): Promise<void> {
    await this.request(`/api/films/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleFilmAvailability(id: string): Promise<Film> {
    const response = await this.request<Film>(`/api/films/${id}/toggle-availability`, {
      method: 'PATCH',
    });
    if (!response.data) {
      throw new Error('Failed to toggle availability');
    }
    return response.data;
  }

  async getFilmsByGenre(genre: string | string[]): Promise<Film[]> {
    const genreParam = Array.isArray(genre) ? genre.join(',') : genre;
    const response = await this.request<Film[]>(`/api/films?genre=${encodeURIComponent(genreParam)}`);
    return response.data || [];
  }

  async getFilmsByDirector(director: string): Promise<Film[]> {
    const response = await this.request<Film[]>(`/api/films?director=${encodeURIComponent(director)}`);
    return response.data || [];
  }

  async getAvailableFilms(): Promise<Film[]> {
    const response = await this.request<Film[]>('/api/films?available=true');
    return response.data || [];
  }

  async checkPotentialDuplicates(title: string, director: string, releaseYear: number): Promise<Film[]> {
    const params = new URLSearchParams({
      title: title.trim(),
      director: director.trim(),
      releaseYear: releaseYear.toString()
    });
    
    const response = await this.request<Film[]>(`/api/films/check-duplicates?${params}`);
    return response.data || [];
  }

  async upsertFilm(filmData: CreateFilmRequest): Promise<{ film: Film; wasCreated: boolean }> {
    const url = `${this.baseUrl}/api/films/upsert`;
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filmData),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // The API returns { success: true, data: Film, wasCreated: boolean }
      return { 
        film: data.data, 
        wasCreated: data.wasCreated 
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error');
    }
  }

  async getFilmsAvailableForRental(): Promise<Film[]> {
    const response = await this.request<Film[]>('/api/films/available-for-rental');
    return response.data || [];
  }

  async updateFilmQuantity(id: string, quantity: number, availabilityQuantity?: number): Promise<Film> {
    const response = await this.request<Film>(`/api/films/${id}/quantity`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, availabilityQuantity }),
    });
    if (!response.data) {
      throw new Error('Failed to update film quantity');
    }
    return response.data;
  }

  async updateFilmAvailabilityQuantity(id: string, availabilityQuantity: number): Promise<Film> {
    const response = await this.request<Film>(`/api/films/${id}/availability-quantity`, {
      method: 'PATCH',
      body: JSON.stringify({ availabilityQuantity }),
    });
    if (!response.data) {
      throw new Error('Failed to update film availability quantity');
    }
    return response.data;
  }
}

export const filmService = new FilmService();

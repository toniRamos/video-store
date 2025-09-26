import { API_BASE_URL } from '../../../shared/config/api';
import { 
  Rental, 
  CreateRentalRequest, 
  ReturnRentalRequest, 
  RentalAnalytics, 
  RentalEligibility,
  RentalStatus 
} from '../types/Rental';

export interface RentalsResponse {
  message: string;
  data: {
    rentals: Rental[];
    filters?: any;
    limit: number;
    offset: number;
    count: number;
  };
}

export interface RentalResponse {
  message: string;
  data: Rental;
}

export interface AnalyticsResponse {
  message: string;
  data: RentalAnalytics;
}

export interface EligibilityResponse {
  message: string;
  data: RentalEligibility;
}

export interface UserRentalsResponse {
  message: string;
  data: {
    userId: string;
    rentals: Rental[];
    activeOnly: boolean;
    count: number;
  };
}

export interface FilmRentalsResponse {
  message: string;
  data: {
    filmId: string;
    rentals: Rental[];
    count: number;
  };
}

class RentalService {
  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RentalService error:', error);
      throw error;
    }
  }

  async createRental(request: CreateRentalRequest): Promise<Rental> {
    const response = await this.fetchWithErrorHandling<RentalResponse>(
      `${API_BASE_URL}/rentals`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.data;
  }

  async returnRental(rentalId: string, returnDate?: string): Promise<Rental> {
    const request: ReturnRentalRequest = { rentalId };
    if (returnDate) {
      request.returnDate = returnDate;
    }

    const response = await this.fetchWithErrorHandling<RentalResponse>(
      `${API_BASE_URL}/rentals/${rentalId}/return`,
      {
        method: 'PUT',
        body: JSON.stringify(request),
      }
    );
    return response.data;
  }

  async getRentalById(id: string): Promise<Rental> {
    const response = await this.fetchWithErrorHandling<RentalResponse>(
      `${API_BASE_URL}/rentals/${id}`
    );
    return response.data;
  }

  async searchRentals(filters?: {
    userId?: string;
    filmId?: string;
    status?: RentalStatus;
    limit?: number;
    offset?: number;
  }): Promise<RentalsResponse['data']> {
    const params = new URLSearchParams();
    
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.filmId) params.append('filmId', filters.filmId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.fetchWithErrorHandling<RentalsResponse>(
      `${API_BASE_URL}/rentals?${params.toString()}`
    );
    return response.data;
  }

  async getUserRentals(userId: string, activeOnly: boolean = false, limit?: number, offset?: number): Promise<UserRentalsResponse['data']> {
    const params = new URLSearchParams();
    params.append('active', activeOnly.toString());
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await this.fetchWithErrorHandling<UserRentalsResponse>(
      `${API_BASE_URL}/rentals/users/${userId}?${params.toString()}`
    );
    return response.data;
  }

  async getFilmRentals(filmId: string, limit?: number, offset?: number): Promise<FilmRentalsResponse['data']> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await this.fetchWithErrorHandling<FilmRentalsResponse>(
      `${API_BASE_URL}/rentals/films/${filmId}?${params.toString()}`
    );
    return response.data;
  }

  async getOverdueRentals(): Promise<Rental[]> {
    const response = await this.fetchWithErrorHandling<{
      message: string;
      data: { rentals: Rental[]; count: number };
    }>(`${API_BASE_URL}/rentals/overdue`);
    return response.data.rentals;
  }

  async getAnalytics(): Promise<RentalAnalytics> {
    const response = await this.fetchWithErrorHandling<AnalyticsResponse>(
      `${API_BASE_URL}/rentals/analytics`
    );
    return response.data;
  }

  async extendRental(rentalId: string, additionalDays: number): Promise<Rental> {
    const response = await this.fetchWithErrorHandling<RentalResponse>(
      `${API_BASE_URL}/rentals/${rentalId}/extend`,
      {
        method: 'PUT',
        body: JSON.stringify({ additionalDays }),
      }
    );
    return response.data;
  }

  async checkRentalEligibility(userId: string, filmId: string): Promise<RentalEligibility> {
    const response = await this.fetchWithErrorHandling<EligibilityResponse>(
      `${API_BASE_URL}/rentals/check-eligibility`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, filmId }),
      }
    );
    return response.data;
  }

  // Utility methods
  formatRentalStatus(status: RentalStatus): string {
    switch (status) {
      case RentalStatus.ACTIVE:
        return 'Active';
      case RentalStatus.RETURNED:
        return 'Returned';
      case RentalStatus.OVERDUE:
        return 'Overdue';
      default:
        return 'Unknown';
    }
  }

  getStatusColor(status: RentalStatus): string {
    switch (status) {
      case RentalStatus.ACTIVE:
        return '#28a745'; // green
      case RentalStatus.RETURNED:
        return '#6c757d'; // gray
      case RentalStatus.OVERDUE:
        return '#dc3545'; // red
      default:
        return '#6c757d';
    }
  }

  calculateDaysRemaining(expectedReturnDate: string): number {
    const expected = new Date(expectedReturnDate);
    const now = new Date();
    const diffTime = expected.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(expectedReturnDate: string, actualReturnDate?: string | null): boolean {
    if (actualReturnDate) return false; // Already returned
    const expected = new Date(expectedReturnDate);
    return new Date() > expected;
  }
}

export const rentalService = new RentalService();
export default rentalService;

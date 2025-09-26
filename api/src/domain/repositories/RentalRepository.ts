import { Rental, RentalStatus } from '../entities/Rental';

export interface RentalRepository {
  // Basic CRUD operations
  save(rental: Rental): Promise<Rental>;
  update(rental: Rental): Promise<Rental>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Rental | null>;
  findAll(limit?: number, offset?: number): Promise<Rental[]>;
  exists(id: string): Promise<boolean>;
  
  // User-related queries
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Rental[]>;
  findActiveRentalsByUserId(userId: string): Promise<Rental[]>;
  countByUserId(userId: string): Promise<number>;
  
  // Film-related queries
  findByFilmId(filmId: string, limit?: number, offset?: number): Promise<Rental[]>;
  findActiveRentalsByFilmId(filmId: string): Promise<Rental[]>;
  countByFilmId(filmId: string): Promise<number>;
  
  // Status-based queries
  findByStatus(status: RentalStatus, limit?: number, offset?: number): Promise<Rental[]>;
  findOverdueRentals(): Promise<Rental[]>;
  countByStatus(status: RentalStatus): Promise<number>;
  
  // Business queries
  findUserFilmRental(userId: string, filmId: string): Promise<Rental | null>;
  findActiveUserFilmRental(userId: string, filmId: string): Promise<Rental | null>;
  
  // Analytics queries
  getTotalRevenue(): Promise<number>;
  getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number>;
  getMostRentedFilms(limit?: number): Promise<Array<{ filmId: string; count: number }>>;
  getMostActiveUsers(limit?: number): Promise<Array<{ userId: string; count: number }>>;
  
  // Rental history
  getRentalHistory(limit?: number, offset?: number): Promise<{
    rentals: Rental[];
    totalCount: number;
  }>;
}

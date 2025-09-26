import { Rental, RentalStatus } from '../../domain/entities/Rental';
import { RentalRepository } from '../../domain/repositories/RentalRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { FilmRepository } from '../../domain/repositories/FilmRepository';

export interface CreateRentalRequest {
  userId: string;
  filmId: string;
  rentalPeriodDays?: number;
}

export interface ReturnRentalRequest {
  rentalId: string;
  returnDate?: Date;
}

export interface RentalSearchFilters {
  userId?: string;
  filmId?: string;
  status?: RentalStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface RentalAnalytics {
  totalActiveRentals: number;
  totalReturnedRentals: number;
  totalOverdueRentals: number;
  totalRevenue: number;
  averageRentalDuration: number;
  mostRentedFilms: Array<{ filmId: string; title: string; count: number }>;
  mostActiveUsers: Array<{ userId: string; userName: string; count: number }>;
}

export class RentalService {
  constructor(
    private rentalRepository: RentalRepository,
    private userRepository: UserRepository,
    private filmRepository: FilmRepository
  ) {}

  async createRental(request: CreateRentalRequest): Promise<Rental> {
    const { userId, filmId, rentalPeriodDays = 7 } = request;

    // Validate input
    if (!userId || !filmId) {
      throw new Error('User ID and Film ID are required');
    }

    if (!Rental.validateRentalPeriod(rentalPeriodDays)) {
      throw new Error('Invalid rental period. Must be between 1 and 30 days');
    }

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.active) {
      throw new Error('User account is not active');
    }

    // Check if film exists and is available
    const film = await this.filmRepository.findById(filmId);
    if (!film) {
      throw new Error('Film not found');
    }

    if (!film.available) {
      throw new Error('Film is not available for rental');
    }

    // Check if film has available copies
    if (!film.isAvailableForRental()) {
      throw new Error('No copies available for rental');
    }

    // Check if user already has an active rental for this film
    const existingActiveRental = await this.rentalRepository.findActiveUserFilmRental(userId, filmId);
    if (existingActiveRental) {
      throw new Error('User already has an active rental for this film');
    }

    // Create the rental
    const rental = Rental.create(userId, filmId, rentalPeriodDays, film.price);

    // Save rental
    const savedRental = await this.rentalRepository.save(rental);

    // Update film availability quantity
    const updatedFilm = film.decreaseAvailableQuantity();
    await this.filmRepository.update(updatedFilm);

    console.log(`🎬 New rental created: User ${userId} rented film ${filmId}`);
    return savedRental;
  }

  async returnRental(request: ReturnRentalRequest): Promise<Rental> {
    const { rentalId, returnDate = new Date() } = request;

    if (!rentalId) {
      throw new Error('Rental ID is required');
    }

    // Find the rental
    const rental = await this.rentalRepository.findById(rentalId);
    if (!rental) {
      throw new Error('Rental not found');
    }

    if (rental.isReturned()) {
      throw new Error('Rental has already been returned');
    }

    // Calculate late fee if overdue
    let lateFee = 0;
    if (rental.isOverdue(returnDate)) {
      lateFee = rental.calculateLateFee(3.0, returnDate); // $3 per day late fee
    }

    // Return the film
    const returnedRental = rental.returnFilm(returnDate, lateFee);
    const updatedRental = await this.rentalRepository.update(returnedRental);

    // Update film availability quantity
    const film = await this.filmRepository.findById(rental.filmId);
    if (film) {
      const updatedFilm = film.increaseAvailableQuantity();
      await this.filmRepository.update(updatedFilm);
    }

    console.log(`📥 Rental returned: ${rentalId} (Late fee: $${lateFee})`);
    return updatedRental;
  }

  async getRentalById(id: string): Promise<Rental | null> {
    if (!id) {
      throw new Error('Rental ID is required');
    }

    return await this.rentalRepository.findById(id);
  }

  async getUserRentals(userId: string, limit: number = 50, offset: number = 0): Promise<Rental[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Verify user exists
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      throw new Error('User not found');
    }

    return await this.rentalRepository.findByUserId(userId, limit, offset);
  }

  async getUserActiveRentals(userId: string): Promise<Rental[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.rentalRepository.findActiveRentalsByUserId(userId);
  }

  async getFilmRentals(filmId: string, limit: number = 50, offset: number = 0): Promise<Rental[]> {
    if (!filmId) {
      throw new Error('Film ID is required');
    }

    // Verify film exists
    const filmExists = await this.filmRepository.exists(filmId);
    if (!filmExists) {
      throw new Error('Film not found');
    }

    return await this.rentalRepository.findByFilmId(filmId, limit, offset);
  }

  async getOverdueRentals(): Promise<Rental[]> {
    const overdueRentals = await this.rentalRepository.findOverdueRentals();
    
    // Update status to OVERDUE for rentals that are overdue but still marked as ACTIVE
    const updatedRentals: Rental[] = [];
    
    for (const rental of overdueRentals) {
      if (rental.status === RentalStatus.ACTIVE && rental.isOverdue()) {
        const updatedRental = rental.updateStatus(RentalStatus.OVERDUE);
        await this.rentalRepository.update(updatedRental);
        updatedRentals.push(updatedRental);
      } else {
        updatedRentals.push(rental);
      }
    }
    
    return updatedRentals;
  }

  async searchRentals(filters: RentalSearchFilters, limit: number = 50, offset: number = 0): Promise<Rental[]> {
    if (filters.userId) {
      return await this.getUserRentals(filters.userId, limit, offset);
    }
    
    if (filters.filmId) {
      return await this.getFilmRentals(filters.filmId, limit, offset);
    }
    
    if (filters.status) {
      return await this.rentalRepository.findByStatus(filters.status, limit, offset);
    }
    
    // For now, return all rentals if no specific filter is provided
    return await this.rentalRepository.findAll(limit, offset);
  }

  async getRentalAnalytics(): Promise<RentalAnalytics> {
    try {
      const [
        activeCount,
        returnedCount,
        overdueCount,
        totalRevenue,
        mostRentedFilmsData,
        mostActiveUsersData
      ] = await Promise.all([
        this.rentalRepository.countByStatus(RentalStatus.ACTIVE),
        this.rentalRepository.countByStatus(RentalStatus.RETURNED),
        this.rentalRepository.countByStatus(RentalStatus.OVERDUE),
        this.rentalRepository.getTotalRevenue(),
        this.rentalRepository.getMostRentedFilms(5),
        this.rentalRepository.getMostActiveUsers(5)
      ]);

      // Enrich most rented films with film details
      const mostRentedFilms = [];
      for (const filmData of mostRentedFilmsData) {
        const film = await this.filmRepository.findById(filmData.filmId);
        mostRentedFilms.push({
          filmId: filmData.filmId,
          title: film?.title || 'Unknown Film',
          count: filmData.count
        });
      }

      // Enrich most active users with user details
      const mostActiveUsers = [];
      for (const userData of mostActiveUsersData) {
        const user = await this.userRepository.findById(userData.userId);
        mostActiveUsers.push({
          userId: userData.userId,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
          count: userData.count
        });
      }

      // Calculate average rental duration (simplified)
      const averageRentalDuration = 7; // Default for now, could be calculated from actual data

      return {
        totalActiveRentals: activeCount,
        totalReturnedRentals: returnedCount,
        totalOverdueRentals: overdueCount,
        totalRevenue,
        averageRentalDuration,
        mostRentedFilms,
        mostActiveUsers
      };
    } catch (error) {
      console.error('❌ Error getting rental analytics:', error);
      throw new Error('Failed to get rental analytics');
    }
  }

  async extendRental(rentalId: string, additionalDays: number): Promise<Rental> {
    if (!rentalId) {
      throw new Error('Rental ID is required');
    }

    if (additionalDays <= 0 || additionalDays > 14) {
      throw new Error('Additional days must be between 1 and 14');
    }

    const rental = await this.rentalRepository.findById(rentalId);
    if (!rental) {
      throw new Error('Rental not found');
    }

    if (!rental.isActive()) {
      throw new Error('Can only extend active rentals');
    }

    // Create new rental with extended return date
    const newExpectedReturnDate = new Date(rental.expectedReturnDate);
    newExpectedReturnDate.setDate(newExpectedReturnDate.getDate() + additionalDays);

    const extendedRental = new Rental(
      rental.id,
      rental.userId,
      rental.filmId,
      rental.rentalDate,
      newExpectedReturnDate,
      rental.actualReturnDate,
      rental.status,
      rental.rentalPrice,
      rental.lateFee,
      rental.createdAt,
      new Date()
    );

    const updatedRental = await this.rentalRepository.update(extendedRental);
    
    console.log(`📅 Rental extended: ${rentalId} (+${additionalDays} days)`);
    return updatedRental;
  }

  async getRentalHistory(limit: number = 50, offset: number = 0): Promise<{
    rentals: Rental[];
    totalCount: number;
  }> {
    return await this.rentalRepository.getRentalHistory(limit, offset);
  }

  // Utility methods
  async canUserRentFilm(userId: string, filmId: string): Promise<{
    canRent: boolean;
    reason?: string;
  }> {
    try {
      // Check if user exists and is active
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return { canRent: false, reason: 'User not found' };
      }
      
      if (!user.active) {
        return { canRent: false, reason: 'User account is not active' };
      }

      // Check if film exists and is available
      const film = await this.filmRepository.findById(filmId);
      if (!film) {
        return { canRent: false, reason: 'Film not found' };
      }

      if (!film.available) {
        return { canRent: false, reason: 'Film is not available for rental' };
      }

      if (!film.isAvailableForRental()) {
        return { canRent: false, reason: 'No copies available for rental' };
      }

      // Check if user already has an active rental for this film
      const existingActiveRental = await this.rentalRepository.findActiveUserFilmRental(userId, filmId);
      if (existingActiveRental) {
        return { canRent: false, reason: 'User already has an active rental for this film' };
      }

      return { canRent: true };
    } catch (error) {
      console.error('❌ Error checking if user can rent film:', error);
      return { canRent: false, reason: 'Error checking rental eligibility' };
    }
  }
}

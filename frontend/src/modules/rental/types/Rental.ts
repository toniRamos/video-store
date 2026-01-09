export enum RentalStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE'
}

export interface Rental {
  id: string;
  userId: string;
  filmId: string;
  rentalDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  status: RentalStatus;
  rentalPrice: number;
  lateFee: number;
  createdAt: string;
  updatedAt: string;
  // Extended properties for display
  userName?: string;
  filmTitle?: string;
}

export interface CreateRentalRequest {
  userId: string;
  filmId: string;
  rentalPeriodDays?: number;
}

export interface ReturnRentalRequest {
  rentalId: string;
  returnDate?: string;
}

export interface TopFilmStats {
  filmId: string;
  filmTitle?: string;
  rentalCount: number;
  totalRevenue: number;
}

export interface TopUserStats {
  userId: string;
  userName?: string;
  rentalCount: number;
  totalSpent: number;
}

export interface RentalAnalytics {
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
  totalRevenue: number;
  averageRentalDays: number;
  totalLateFees: number;
  topFilms: TopFilmStats[];
  topUsers: TopUserStats[];
}

export interface RentalEligibility {
  canRent: boolean;
  reason?: string;
}

// Extended rental with populated data
export interface RentalWithDetails extends Rental {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    personalIdentifier: string;
  };
  film?: {
    id: string;
    title: string;
    director: string;
    genre: string[];
    price: number;
  };
}

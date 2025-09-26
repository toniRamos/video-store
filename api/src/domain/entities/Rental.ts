import { v4 as uuidv4 } from 'uuid';

export enum RentalStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE'
}

export class Rental {
  public readonly id: string;
  public readonly userId: string;
  public readonly filmId: string;
  public readonly rentalDate: Date;
  public readonly expectedReturnDate: Date;
  public readonly actualReturnDate: Date | null;
  public readonly status: RentalStatus;
  public readonly rentalPrice: number;
  public readonly lateFee: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    filmId: string,
    rentalDate: Date,
    expectedReturnDate: Date,
    actualReturnDate: Date | null,
    status: RentalStatus,
    rentalPrice: number,
    lateFee: number = 0,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.filmId = filmId;
    this.rentalDate = rentalDate;
    this.expectedReturnDate = expectedReturnDate;
    this.actualReturnDate = actualReturnDate;
    this.status = status;
    this.rentalPrice = rentalPrice;
    this.lateFee = lateFee;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    userId: string,
    filmId: string,
    rentalPeriodDays: number = 7,
    rentalPrice: number
  ): Rental {
    const now = new Date();
    const expectedReturnDate = new Date();
    expectedReturnDate.setDate(now.getDate() + rentalPeriodDays);

    return new Rental(
      uuidv4(),
      userId,
      filmId,
      now,
      expectedReturnDate,
      null,
      RentalStatus.ACTIVE,
      rentalPrice,
      0,
      now,
      now
    );
  }

  // Business logic methods
  isOverdue(): boolean {
    if (this.status === RentalStatus.RETURNED) {
      return false;
    }
    return new Date() > this.expectedReturnDate;
  }

  getDaysRented(): number {
    const endDate = this.actualReturnDate || new Date();
    const diffTime = Math.abs(endDate.getTime() - this.rentalDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) {
      return 0;
    }
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.expectedReturnDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateLateFee(dailyLateFeeRate: number = 2.0): number {
    const daysOverdue = this.getDaysOverdue();
    return daysOverdue * dailyLateFeeRate;
  }

  returnFilm(returnDate: Date = new Date(), lateFee: number = 0): Rental {
    return new Rental(
      this.id,
      this.userId,
      this.filmId,
      this.rentalDate,
      this.expectedReturnDate,
      returnDate,
      RentalStatus.RETURNED,
      this.rentalPrice,
      lateFee,
      this.createdAt,
      new Date()
    );
  }

  updateStatus(newStatus: RentalStatus): Rental {
    return new Rental(
      this.id,
      this.userId,
      this.filmId,
      this.rentalDate,
      this.expectedReturnDate,
      this.actualReturnDate,
      newStatus,
      this.rentalPrice,
      this.lateFee,
      this.createdAt,
      new Date()
    );
  }

  getTotalCost(): number {
    return this.rentalPrice + this.lateFee;
  }

  isActive(): boolean {
    return this.status === RentalStatus.ACTIVE;
  }

  isReturned(): boolean {
    return this.status === RentalStatus.RETURNED;
  }

  // Validation methods
  static validateRentalPeriod(days: number): boolean {
    return days > 0 && days <= 30; // Maximum 30 days rental
  }

  static validatePrice(price: number): boolean {
    return price > 0;
  }
}

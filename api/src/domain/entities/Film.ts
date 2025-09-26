export class Film {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly director: string,
    public readonly releaseYear: number,
    public readonly genre: string,
    public readonly duration: number, // in minutes
    public readonly description: string,
    public readonly available: boolean = true,
    public readonly price: number,
    public readonly quantity: number = 1, // Total copies available in inventory
    public readonly availabilityQuantity: number = 1, // Copies available for rental
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    this.validateFilm();
  }

  private validateFilm(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (!this.director || this.director.trim().length === 0) {
      throw new Error('Director is required');
    }

    if (this.releaseYear < 1895 || this.releaseYear > new Date().getFullYear() + 5) {
      throw new Error('Release year must be between 1895 and 5 years in the future');
    }

    if (!this.genre || this.genre.trim().length === 0) {
      throw new Error('Genre is required');
    }

    if (this.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }

    if (this.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (this.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (this.availabilityQuantity < 0) {
      throw new Error('Availability quantity cannot be negative');
    }

    if (this.availabilityQuantity > this.quantity) {
      throw new Error('Availability quantity cannot exceed total quantity');
    }
  }

  public static create(
    id: string,
    title: string,
    director: string,
    releaseYear: number,
    genre: string,
    duration: number,
    description: string,
    price: number,
    available: boolean = true,
    quantity: number = 1,
    availabilityQuantity?: number
  ): Film {
    return new Film(
      id,
      title,
      director,
      releaseYear,
      genre,
      duration,
      description,
      available,
      price,
      quantity,
      availabilityQuantity ?? quantity, // If not provided, assume all copies are available
    );
  }

  public updateAvailability(available: boolean): Film {
    return new Film(
      this.id,
      this.title,
      this.director,
      this.releaseYear,
      this.genre,
      this.duration,
      this.description,
      available,
      this.price,
      this.quantity,
      this.availabilityQuantity,
      this.createdAt,
      new Date()
    );
  }

  public updatePrice(price: number): Film {
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }
    
    return new Film(
      this.id,
      this.title,
      this.director,
      this.releaseYear,
      this.genre,
      this.duration,
      this.description,
      this.available,
      price,
      this.quantity,
      this.availabilityQuantity,
      this.createdAt,
      new Date()
    );
  }

  public updateQuantity(quantity: number, availabilityQuantity?: number): Film {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const newAvailabilityQuantity = availabilityQuantity ?? Math.min(this.availabilityQuantity, quantity);

    return new Film(
      this.id,
      this.title,
      this.director,
      this.releaseYear,
      this.genre,
      this.duration,
      this.description,
      this.available,
      this.price,
      quantity,
      newAvailabilityQuantity,
      this.createdAt,
      new Date()
    );
  }

  public updateAvailabilityQuantity(availabilityQuantity: number): Film {
    if (availabilityQuantity < 0) {
      throw new Error('Availability quantity cannot be negative');
    }

    if (availabilityQuantity > this.quantity) {
      throw new Error('Availability quantity cannot exceed total quantity');
    }

    return new Film(
      this.id,
      this.title,
      this.director,
      this.releaseYear,
      this.genre,
      this.duration,
      this.description,
      this.available,
      this.price,
      this.quantity,
      availabilityQuantity,
      this.createdAt,
      new Date()
    );
  }

  public isAvailableForRental(): boolean {
    return this.available && this.availabilityQuantity > 0;
  }

  public getRentedQuantity(): number {
    return this.quantity - this.availabilityQuantity;
  }

  public decreaseAvailableQuantity(count: number = 1): Film {
    const newAvailability = this.availabilityQuantity - count;
    
    if (newAvailability < 0) {
      throw new Error('Cannot decrease availability below 0');
    }
    
    return new Film(
      this.id,
      this.title,
      this.director,
      this.releaseYear,
      this.genre,
      this.duration,
      this.description,
      this.available,
      this.price,
      this.quantity,
      newAvailability,
      this.createdAt,
      new Date()
    );
  }

  public increaseAvailableQuantity(count: number = 1): Film {
    const newAvailability = this.availabilityQuantity + count;
    
    if (newAvailability > this.quantity) {
      throw new Error('Cannot increase availability beyond total quantity');
    }
    
    return new Film(
      this.id,
      this.title,
      this.director,
      this.releaseYear,
      this.genre,
      this.duration,
      this.description,
      this.available,
      this.price,
      this.quantity,
      newAvailability,
      this.createdAt,
      new Date()
    );
  }

  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      director: this.director,
      releaseYear: this.releaseYear,
      genre: this.genre,
      duration: this.duration,
      description: this.description,
      available: this.available,
      price: this.price,
      quantity: this.quantity,
      availabilityQuantity: this.availabilityQuantity,
      isAvailableForRental: this.isAvailableForRental(),
      rentedQuantity: this.getRentedQuantity(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

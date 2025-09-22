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
    available: boolean = true
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
      price
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export interface Film {
  id: string;
  title: string;
  director: string;
  releaseYear: number;
  genre: string[];
  duration: number;
  description: string;
  available: boolean;
  price: number;
  quantity: number;
  availabilityQuantity: number;
  isAvailableForRental: boolean;
  rentedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFilmRequest {
  title: string;
  director: string;
  releaseYear: number;
  genre: string[];
  duration: number;
  description: string;
  price: number;
}

export interface UpdateFilmRequest {
  title?: string;
  director?: string;
  releaseYear?: number;
  genre?: string[];
  duration?: number;
  description?: string;
  price?: number;
}

// ApiResponse moved to shared types

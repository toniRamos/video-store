export interface Film {
  id: string;
  title: string;
  director: string;
  releaseYear: number;
  genre: string;
  duration: number;
  description: string;
  available: boolean;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFilmRequest {
  title: string;
  director: string;
  releaseYear: number;
  genre: string;
  duration: number;
  description: string;
  price: number;
  available?: boolean;
}

export interface UpdateFilmRequest {
  title?: string;
  director?: string;
  releaseYear?: number;
  genre?: string;
  duration?: number;
  description?: string;
  price?: number;
  available?: boolean;
}

// ApiResponse moved to shared types

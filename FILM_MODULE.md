# Film Module - Video Store API

## Overview
The Film module provides complete CRUD operations for film management in the video store application. It follows a clean architecture pattern with domain entities, repositories, services, and controllers, ensuring maintainable and scalable code.

## Features
- Complete film management (Create, Read, Update, Delete)
- Film validation (title, director, release year, genre, duration)
- Price and availability management
- Multiple search options (by title, director, genre, availability)
- MongoDB integration with indexes for performance
- Release year validation (1895 to 5 years in the future)
- Duration and price validation

## Film Properties
- **Title**: Film title with validation
- **Director**: Film director name
- **Release Year**: Year of release (1895 to current year + 5)
- **Genre**: Film genre/category
- **Duration**: Film duration in minutes (must be > 0)
- **Description**: Detailed film description
- **Price**: Rental/purchase price (cannot be negative)
- **Availability**: Whether the film is available for rent/purchase
- **Timestamps**: Creation and update timestamps

## API Endpoints

### Film Management
- `POST /api/films` - Create a new film
- `GET /api/films` - Get all films
- `GET /api/films/:id` - Get film by ID
- `PUT /api/films/:id` - Update film
- `PATCH /api/films/:id/availability` - Update film availability
- `PATCH /api/films/:id/price` - Update film price
- `DELETE /api/films/:id` - Delete film

### Search Operations
- `GET /api/films/title/:title` - Search films by title
- `GET /api/films/director/:director` - Get films by director
- `GET /api/films/genre/:genre` - Get films by genre
- `GET /api/films/available` - Get available films
- `GET /api/films/unavailable` - Get unavailable films
- `GET /api/films/year/:year` - Get films by release year

### Utility Operations
- `GET /api/films/:id/exists` - Check if film exists
- `GET /api/films/search` - Advanced search with query parameters

## Architecture

### Domain Layer
- **Film Entity** (`domain/entities/Film.ts`): Core business entity with validation rules
- **FilmRepository Interface** (`domain/repositories/FilmRepository.ts`): Repository contract

### Infrastructure Layer
- **MongoFilmRepository** (`infrastructure/repositories/MongoFilmRepository.ts`): MongoDB implementation

### Application Layer
- **FilmService** (`application/services/FilmService.ts`): Business logic and use cases
- **FilmController** (`application/controllers/FilmController.ts`): HTTP request handling
- **Film Routes** (`application/routes/filmRoutes.ts`): Route definitions with Swagger docs

## Validation Rules
- **Title**: Required, cannot be empty
- **Director**: Required, cannot be empty
- **Release Year**: Must be between 1895 and current year + 5
- **Genre**: Required, cannot be empty
- **Duration**: Must be greater than 0 minutes
- **Price**: Cannot be negative
- **Description**: Required for film details

## Example Usage

### Create Film
```json
POST /api/films
{
  "title": "The Shawshank Redemption",
  "director": "Frank Darabont",
  "releaseYear": 1994,
  "genre": "Drama",
  "duration": 142,
  "description": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
  "price": 4.99,
  "available": true
}
```

### Update Film Availability
```json
PATCH /api/films/:id/availability
{
  "available": false
}
```

### Update Film Price
```json
PATCH /api/films/:id/price
{
  "price": 3.99
}
```

### Search Films by Genre
```http
GET /api/films/genre/Drama
```

## Business Logic Methods

### Film Entity Methods
- `Film.create()` - Static factory method for creating films
- `updateAvailability(available: boolean)` - Update film availability status
- `updatePrice(price: number)` - Update film rental/purchase price
- `toJSON()` - Serialize film to JSON format

### Service Methods
- `createFilm(request)` - Create new film with validation
- `getFilmById(id)` - Retrieve film by unique identifier
- `getAllFilms()` - Get all films in the system
- `getFilmsByTitle(title)` - Search films by title (partial match)
- `getFilmsByDirector(director)` - Get all films by a director
- `getFilmsByGenre(genre)` - Get films filtered by genre
- `getAvailableFilms()` - Get only available films
- `updateFilm(id, request)` - Update existing film
- `deleteFilm(id)` - Remove film from system
- `filmExists(id)` - Check if film exists

## Database Indexes
The following indexes are automatically created for optimal performance:
- `id` (unique) - Primary identifier
- `title` - For title-based searches
- `director` - For director-based searches  
- `genre` - For genre filtering
- `available` - For availability filtering

## Error Handling
- **400 Bad Request**: Invalid input data or validation errors
  - Invalid release year
  - Negative duration or price
  - Missing required fields
- **404 Not Found**: Film not found
- **409 Conflict**: Film with same ID already exists
- **500 Internal Server Error**: Database or server errors

## Response Format
All endpoints return a consistent response format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null
}
```

## Film Validation Details

### Release Year Validation
- Minimum: 1895 (first known film)
- Maximum: Current year + 5 (allows for upcoming releases)

### Duration Validation  
- Must be greater than 0 minutes
- Stored as integer (minutes)

### Price Validation
- Cannot be negative
- Supports decimal values for pricing
- Required field for business logic

### Text Field Validation
- Title, director, genre, and description are required
- Empty strings or whitespace-only values are rejected

## Integration Points
The Film module integrates with:
- **MongoDB**: For data persistence
- **Express.js**: For HTTP API endpoints  
- **Swagger**: For API documentation
- **UUID**: For unique identifier generation

The module is designed to be easily extensible for future features like film ratings, categories, or rental tracking.

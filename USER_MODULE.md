# User Module - Video Store API

## Overview
The User module provides complete CRUD operations for user management in the video store application. It follows the same clean architecture pattern as the Film module with domain entities, repositories, services, and controllers.

## Features
- Complete user management (Create, Read, Update, Delete)
- Personal identifier validation (DNI, NIE, Passport, etc.)
- Email uniqueness validation
- Age validation (minimum 18 years)
- Membership type management (standard, premium, vip)
- Multiple search options (by name, city, country, membership, status)
- MongoDB integration with indexes for performance

## User Properties
- **Personal Identifier**: DNI, NIE, Passport, or any other identification
- **First Name & Last Name**: User's full name
- **Email**: Unique email address with validation
- **Phone**: Contact phone number
- **Address Details**: Street address, city, postal code, country
- **Date of Birth**: With age calculation and 18+ validation
- **Membership Type**: standard, premium, or vip
- **Status**: Active/inactive account status
- **Timestamps**: Registration date, creation and update timestamps

## API Endpoints

### User Management
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user

### Search Operations
- `GET /api/users/personal-identifier/:personalIdentifier` - Get user by personal ID
- `GET /api/users/email/:email` - Get user by email
- `GET /api/users/search/name?firstName=X&lastName=Y` - Search by name
- `GET /api/users/city/:city` - Get users by city
- `GET /api/users/membership/:type` - Get users by membership type
- `GET /api/users/status/active` - Get active users

## Architecture

### Domain Layer
- **User Entity** (`domain/entities/User.ts`): Core business entity with validation rules
- **UserRepository Interface** (`domain/repositories/UserRepository.ts`): Repository contract

### Infrastructure Layer
- **MongoUserRepository** (`infrastructure/repositories/MongoUserRepository.ts`): MongoDB implementation

### Application Layer
- **UserService** (`application/services/UserService.ts`): Business logic and use cases
- **UserController** (`application/controllers/UserController.ts`): HTTP request handling
- **User Routes** (`application/routes/userRoutes.ts`): Route definitions with Swagger docs

## Validation Rules
- All required fields must be provided
- Personal identifier must be unique
- Email must be unique and valid format
- User must be at least 18 years old
- Membership type must be one of: standard, premium, vip
- Phone and address information is required

## Example Usage

### Create User
```json
POST /api/users
{
  "personalIdentifier": "12345678A",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "+34 600 123 456",
  "address": "Calle Mayor 123",
  "city": "Madrid",
  "postalCode": "28001",
  "country": "Spain",
  "dateOfBirth": "1990-05-15",
  "membershipType": "premium"
}
```

### Update User Status
```json
PATCH /api/users/:id/status
{
  "active": false
}
```

## Database Indexes
The following indexes are automatically created for optimal performance:
- `id` (unique)
- `personalIdentifier` (unique)
- `email` (unique)
- `firstName`, `lastName`
- `city`, `country`
- `membershipType`, `active`
- `phone`

## Error Handling
- 400: Invalid input data or validation errors
- 404: User not found
- 409: Conflict (duplicate personal identifier or email)
- 500: Internal server error

The module provides comprehensive error messages for all validation failures and database operations.

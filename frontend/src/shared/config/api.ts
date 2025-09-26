export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// API endpoints
export const ENDPOINTS = {
  films: '/films',
  users: '/users',
  rentals: '/rentals',
} as const;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

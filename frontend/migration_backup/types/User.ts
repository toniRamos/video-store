export interface User {
  id: string;
  personalIdentifier: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  dateOfBirth: string;
  age: number;
  active: boolean;
  membershipType: 'standard' | 'premium' | 'vip';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  personalIdentifier: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  dateOfBirth: string;
  membershipType?: 'standard' | 'premium' | 'vip';
  active?: boolean;
}

export interface UpdateUserRequest {
  personalIdentifier?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string;
  membershipType?: 'standard' | 'premium' | 'vip';
  active?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

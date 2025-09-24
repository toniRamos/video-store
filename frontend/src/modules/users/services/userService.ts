import { User, CreateUserRequest, UpdateUserRequest } from '../types/User';
import { ApiResponse } from '../../shared/types';

class UserService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error');
    }
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.request<User[]>('/api/users');
    return response.data || [];
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.request<User>(`/api/users/${id}`);
    if (!response.data) {
      throw new Error('User not found');
    }
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (!response.data) {
      throw new Error('Failed to create user');
    }
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (!response.data) {
      throw new Error('Failed to update user');
    }
    return response.data;
  }

  async updateUserStatus(id: string, active: boolean): Promise<User> {
    const response = await this.request<User>(`/api/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
    if (!response.data) {
      throw new Error('Failed to update user status');
    }
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserByPersonalIdentifier(personalIdentifier: string): Promise<User> {
    const response = await this.request<User>(`/api/users/personal-identifier/${personalIdentifier}`);
    if (!response.data) {
      throw new Error('User not found');
    }
    return response.data;
  }

  async getUserByEmail(email: string): Promise<User> {
    const response = await this.request<User>(`/api/users/email/${email}`);
    if (!response.data) {
      throw new Error('User not found');
    }
    return response.data;
  }

  async getUsersByName(firstName: string, lastName?: string): Promise<User[]> {
    const params = new URLSearchParams({ firstName });
    if (lastName) {
      params.append('lastName', lastName);
    }
    const response = await this.request<User[]>(`/api/users/search/name?${params.toString()}`);
    return response.data || [];
  }

  async getUsersByCity(city: string): Promise<User[]> {
    const response = await this.request<User[]>(`/api/users/city/${city}`);
    return response.data || [];
  }

  async getUsersByMembershipType(membershipType: string): Promise<User[]> {
    const response = await this.request<User[]>(`/api/users/membership/${membershipType}`);
    return response.data || [];
  }

  async getActiveUsers(): Promise<User[]> {
    const response = await this.request<User[]>('/api/users/status/active');
    return response.data || [];
  }

  async getInactiveUsers(): Promise<User[]> {
    const allUsers = await this.getAllUsers();
    return allUsers.filter(user => !user.active);
  }
}

export const userService = new UserService();

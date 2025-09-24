import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { v4 as uuidv4 } from 'uuid';

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
  dateOfBirth: Date;
  membershipType?: string;
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
  dateOfBirth?: Date;
  membershipType?: string;
  active?: boolean;
}

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(request: CreateUserRequest): Promise<User> {
    // Check if user already exists by personal identifier
    const existingUserByPI = await this.userRepository.findByPersonalIdentifier(request.personalIdentifier);
    if (existingUserByPI) {
      throw new Error('User with this personal identifier already exists');
    }

    // Check if user already exists by email
    const existingUserByEmail = await this.userRepository.findByEmail(request.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const id = uuidv4();
    
    const user = User.create(
      id,
      request.personalIdentifier,
      request.firstName,
      request.lastName,
      request.email,
      request.phone,
      request.address,
      request.city,
      request.postalCode,
      request.country,
      request.dateOfBirth,
      request.membershipType || 'standard',
      request.active !== false
    );

    return await this.userRepository.save(user);
  }

  async getUserById(id: string): Promise<User | null> {
    if (!id) {
      throw new Error('User ID is required');
    }
    
    return await this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserByPersonalIdentifier(personalIdentifier: string): Promise<User | null> {
    if (!personalIdentifier || personalIdentifier.trim().length === 0) {
      throw new Error('Personal identifier is required');
    }
    
    return await this.userRepository.findByPersonalIdentifier(personalIdentifier);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }
    
    return await this.userRepository.findByEmail(email);
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    if (!phone || phone.trim().length === 0) {
      throw new Error('Phone number is required');
    }
    
    return await this.userRepository.findByPhone(phone);
  }

  async getUsersByName(firstName: string, lastName?: string): Promise<User[]> {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    
    return await this.userRepository.findByName(firstName, lastName);
  }

  async getUsersByCity(city: string): Promise<User[]> {
    if (!city || city.trim().length === 0) {
      throw new Error('City is required');
    }
    
    return await this.userRepository.findByCity(city);
  }

  async getUsersByCountry(country: string): Promise<User[]> {
    if (!country || country.trim().length === 0) {
      throw new Error('Country is required');
    }
    
    return await this.userRepository.findByCountry(country);
  }

  async getUsersByMembershipType(membershipType: string): Promise<User[]> {
    if (!membershipType || membershipType.trim().length === 0) {
      throw new Error('Membership type is required');
    }
    
    const validMembershipTypes = ['standard', 'premium', 'vip'];
    if (!validMembershipTypes.includes(membershipType)) {
      throw new Error('Invalid membership type');
    }
    
    return await this.userRepository.findByMembershipType(membershipType);
  }

  async getActiveUsers(): Promise<User[]> {
    return await this.userRepository.findByStatus(true);
  }

  async getInactiveUsers(): Promise<User[]> {
    return await this.userRepository.findByStatus(false);
  }

  async updateUser(id: string, request: UpdateUserRequest): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check if personal identifier is being changed and if it already exists
    if (request.personalIdentifier && request.personalIdentifier !== existingUser.personalIdentifier) {
      const existingUserByPI = await this.userRepository.findByPersonalIdentifier(request.personalIdentifier);
      if (existingUserByPI) {
        throw new Error('User with this personal identifier already exists');
      }
    }

    // Check if email is being changed and if it already exists
    if (request.email && request.email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const existingUserByEmail = await this.userRepository.findByEmail(request.email);
      if (existingUserByEmail) {
        throw new Error('User with this email already exists');
      }
    }

    // Create updated user with new values
    const updatedUser = new User(
      existingUser.id,
      request.personalIdentifier ?? existingUser.personalIdentifier,
      request.firstName ?? existingUser.firstName,
      request.lastName ?? existingUser.lastName,
      request.email ?? existingUser.email,
      request.phone ?? existingUser.phone,
      request.address ?? existingUser.address,
      request.city ?? existingUser.city,
      request.postalCode ?? existingUser.postalCode,
      request.country ?? existingUser.country,
      request.dateOfBirth ?? existingUser.dateOfBirth,
      request.active ?? existingUser.active,
      request.membershipType ?? existingUser.membershipType,
      existingUser.registrationDate,
      existingUser.createdAt,
      new Date() // updated timestamp
    );

    return await this.userRepository.update(updatedUser);
  }

  async updateUserStatus(id: string, active: boolean): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = existingUser.updateStatus(active);
    return await this.userRepository.update(updatedUser);
  }

  async updateUserMembership(id: string, membershipType: string): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = existingUser.updateMembership(membershipType);
    return await this.userRepository.update(updatedUser);
  }

  async updateUserContactInfo(id: string, phone: string, address: string, city: string, postalCode: string): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = existingUser.updateContactInfo(phone, address, city, postalCode);
    return await this.userRepository.update(updatedUser);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const exists = await this.userRepository.exists(id);
    if (!exists) {
      throw new Error('User not found');
    }

    return await this.userRepository.delete(id);
  }

  async userExists(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('User ID is required');
    }
    
    return await this.userRepository.exists(id);
  }

  async userExistsByPersonalIdentifier(personalIdentifier: string): Promise<boolean> {
    if (!personalIdentifier || personalIdentifier.trim().length === 0) {
      throw new Error('Personal identifier is required');
    }
    
    return await this.userRepository.existsByPersonalIdentifier(personalIdentifier);
  }

  async userExistsByEmail(email: string): Promise<boolean> {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }
    
    return await this.userRepository.existsByEmail(email);
  }
}

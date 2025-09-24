import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserAuditRepository } from '../../domain/repositories/UserAuditRepository';
import { UserAuditLogEntity, FieldChange } from '../../domain/entities/UserAuditLog';
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
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditRepository?: UserAuditRepository
  ) {}

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

    const savedUser = await this.userRepository.save(user);

    // Log audit event for user creation
    const changes = this.calculateChanges(null, savedUser);
    await this.logAuditEvent(savedUser.id, 'CREATE', changes);

    return savedUser;
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

    const savedUser = await this.userRepository.update(updatedUser);

    // Log audit event for user update
    const changes = this.calculateChanges(existingUser, savedUser);
    if (changes.length > 0) {
      await this.logAuditEvent(savedUser.id, 'UPDATE', changes);
    }

    return savedUser;
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

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const deleted = await this.userRepository.delete(id);

    if (deleted) {
      // Log audit event for user deletion
      const changes = this.calculateChanges(existingUser, null);
      await this.logAuditEvent(id, 'DELETE', changes);
    }

    return deleted;
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

  // Audit methods

  private async logAuditEvent(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    changes: FieldChange[],
    metadata?: { userAgent?: string; ipAddress?: string; performedBy?: string }
  ): Promise<void> {
    if (!this.auditRepository) {
      return; // Audit is optional
    }

    try {
      const auditLog = UserAuditLogEntity.create(userId, action, changes, metadata);
      await this.auditRepository.save(auditLog);
    } catch (error) {
      console.error('❌ Error logging audit event:', error);
      // Don't throw - audit failure shouldn't break main operation
    }
  }

  private calculateChanges(oldUser: User | null, newUser: User | null): FieldChange[] {
    const changes: FieldChange[] = [];
    
    const userFields: (keyof User)[] = [
      'personalIdentifier', 'firstName', 'lastName', 'email', 
      'phone', 'address', 'city', 'postalCode', 'country', 
      'dateOfBirth', 'membershipType', 'active'
    ];

    if (!oldUser && newUser) {
      // Creation - log all fields as new
      userFields.forEach(field => {
        const value = newUser[field];
        if (value !== undefined) {
          changes.push({
            field: field as string,
            oldValue: null,
            newValue: value,
            dataType: this.getFieldDataType(field, value)
          });
        }
      });

      return changes;
    }

    if (oldUser && !newUser) {
      // Deletion - log all fields as removed
      userFields.forEach(field => {
        const value = oldUser[field];
        if (value !== undefined) {
          changes.push({
            field: field as string,
            oldValue: value,
            newValue: null,
            dataType: this.getFieldDataType(field, value)
          });
        }
      });

      return changes;
    }

    if (oldUser && newUser) {
      // Update - compare fields
      userFields.forEach(field => {
        const oldValue = oldUser[field];
        const newValue = newUser[field];

        if (this.hasFieldChanged(oldValue, newValue)) {
          changes.push({
            field: field as string,
            oldValue: oldValue,
            newValue: newValue,
            dataType: this.getFieldDataType(field, newValue || oldValue)
          });
        }
      });
    }

    return changes;
  }

  private hasFieldChanged(oldValue: any, newValue: any): boolean {
    // Handle dates specially
    if (oldValue instanceof Date && newValue instanceof Date) {
      return oldValue.getTime() !== newValue.getTime();
    }
    
    // Handle null/undefined
    if (oldValue === null || oldValue === undefined) {
      return newValue !== null && newValue !== undefined;
    }
    
    if (newValue === null || newValue === undefined) {
      return true;
    }

    // Regular comparison
    return oldValue !== newValue;
  }

  private getFieldDataType(fieldName: keyof User, value: any): 'string' | 'number' | 'boolean' | 'date' | 'object' {
    if (value instanceof Date) return 'date';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object' && value !== null) return 'object';
    return 'string';
  }

  // Public audit methods

  async getUserAuditHistory(userId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    if (!this.auditRepository) {
      return [];
    }

    try {
      const auditLogs = await this.auditRepository.findByUserId(userId, limit, offset);
      
      return auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        timestamp: log.timestamp,
        changesSummary: (log as UserAuditLogEntity).getChangesSummary(),
        changes: log.changes.map(change => ({
          field: (log as UserAuditLogEntity).getFieldDisplayName(change.field),
          fieldKey: change.field,
          oldValue: (log as UserAuditLogEntity).formatValue(change.oldValue, change.dataType),
          newValue: (log as UserAuditLogEntity).formatValue(change.newValue, change.dataType),
          dataType: change.dataType
        })),
        metadata: log.metadata
      }));
    } catch (error) {
      console.error('❌ Error retrieving audit history:', error);
      throw new Error('Failed to retrieve audit history');
    }
  }

  async getUserAuditCount(userId: string): Promise<number> {
    if (!this.auditRepository) {
      return 0;
    }

    try {
      return await this.auditRepository.getAuditCount(userId);
    } catch (error) {
      console.error('❌ Error counting audit logs:', error);
      return 0;
    }
  }

  async getFieldHistory(userId: string, fieldName: string): Promise<FieldChange[]> {
    if (!this.auditRepository) {
      return [];
    }

    try {
      return await this.auditRepository.getFieldHistory(userId, fieldName);
    } catch (error) {
      console.error('❌ Error retrieving field history:', error);
      throw new Error('Failed to retrieve field history');
    }
  }
}

import { User } from '../entities/User';

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByPersonalIdentifier(personalIdentifier: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByName(firstName: string, lastName?: string): Promise<User[]>;
  findByCity(city: string): Promise<User[]>;
  findByCountry(country: string): Promise<User[]>;
  findByMembershipType(membershipType: string): Promise<User[]>;
  findByStatus(active: boolean): Promise<User[]>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  existsByPersonalIdentifier(personalIdentifier: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}

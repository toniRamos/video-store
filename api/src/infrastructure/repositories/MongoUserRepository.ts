import { Collection, ObjectId } from 'mongodb';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { MongoConnection } from '../database/MongoConnection';

interface UserDocument {
  _id?: ObjectId;
  id: string;
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
  active: boolean;
  membershipType: string;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoUserRepository implements UserRepository {
  private readonly collectionName = 'users';
  private mongoConnection: MongoConnection;

  constructor() {
    this.mongoConnection = MongoConnection.getInstance();
  }

  private getCollection(): Collection<UserDocument> {
    const db = this.mongoConnection.getDatabase();
    return db.collection<UserDocument>(this.collectionName);
  }

  private userToDocument(user: User): UserDocument {
    return {
      id: user.id,
      personalIdentifier: user.personalIdentifier,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      active: user.active,
      membershipType: user.membershipType,
      registrationDate: user.registrationDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private documentToUser(document: UserDocument): User {
    return new User(
      document.id,
      document.personalIdentifier,
      document.firstName,
      document.lastName,
      document.email,
      document.phone,
      document.address,
      document.city,
      document.postalCode,
      document.country,
      document.dateOfBirth,
      document.active,
      document.membershipType,
      document.registrationDate,
      document.createdAt,
      document.updatedAt
    );
  }

  async save(user: User): Promise<User> {
    try {
      const collection = this.getCollection();
      const document = this.userToDocument(user);
      
      await collection.insertOne(document);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('duplicate key error')) {
          throw new Error('User with this ID already exists');
        }
        throw new Error(`Failed to save user: ${error.message}`);
      }
      throw new Error('Failed to save user: Unknown error');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const collection = this.getCollection();
      const document = await collection.findOne({ id });
      
      return document ? this.documentToUser(document) : null;
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();
      
      return documents.map(doc => this.documentToUser(doc));
    } catch (error) {
      throw new Error(`Failed to find all users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByPersonalIdentifier(personalIdentifier: string): Promise<User | null> {
    try {
      const collection = this.getCollection();
      const document = await collection.findOne({ personalIdentifier });
      
      return document ? this.documentToUser(document) : null;
    } catch (error) {
      throw new Error(`Failed to find user by personal identifier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const collection = this.getCollection();
      const document = await collection.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      
      return document ? this.documentToUser(document) : null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      const collection = this.getCollection();
      const document = await collection.findOne({ phone });
      
      return document ? this.documentToUser(document) : null;
    } catch (error) {
      throw new Error(`Failed to find user by phone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByName(firstName: string, lastName?: string): Promise<User[]> {
    try {
      const collection = this.getCollection();
      
      let query: any = {
        firstName: { $regex: new RegExp(firstName, 'i') }
      };
      
      if (lastName) {
        query.lastName = { $regex: new RegExp(lastName, 'i') };
      }
      
      const documents = await collection.find(query).sort({ lastName: 1, firstName: 1 }).toArray();
      
      return documents.map(doc => this.documentToUser(doc));
    } catch (error) {
      throw new Error(`Failed to find users by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCity(city: string): Promise<User[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({ 
        city: { $regex: new RegExp(city, 'i') } 
      }).sort({ lastName: 1, firstName: 1 }).toArray();
      
      return documents.map(doc => this.documentToUser(doc));
    } catch (error) {
      throw new Error(`Failed to find users by city: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCountry(country: string): Promise<User[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({ 
        country: { $regex: new RegExp(country, 'i') } 
      }).sort({ city: 1, lastName: 1, firstName: 1 }).toArray();
      
      return documents.map(doc => this.documentToUser(doc));
    } catch (error) {
      throw new Error(`Failed to find users by country: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByMembershipType(membershipType: string): Promise<User[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({ membershipType }).sort({ registrationDate: -1 }).toArray();
      
      return documents.map(doc => this.documentToUser(doc));
    } catch (error) {
      throw new Error(`Failed to find users by membership type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByStatus(active: boolean): Promise<User[]> {
    try {
      const collection = this.getCollection();
      const documents = await collection.find({ active }).sort({ lastName: 1, firstName: 1 }).toArray();
      
      return documents.map(doc => this.documentToUser(doc));
    } catch (error) {
      throw new Error(`Failed to find users by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(user: User): Promise<User> {
    try {
      const collection = this.getCollection();
      const document = this.userToDocument(user);
      
      const result = await collection.updateOne(
        { id: user.id },
        { $set: document }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      throw new Error('Failed to update user: Unknown error');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({ id });
      
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const collection = this.getCollection();
      const count = await collection.countDocuments({ id });
      
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check if user exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async existsByPersonalIdentifier(personalIdentifier: string): Promise<boolean> {
    try {
      const collection = this.getCollection();
      const count = await collection.countDocuments({ personalIdentifier });
      
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check if user exists by personal identifier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const collection = this.getCollection();
      const count = await collection.countDocuments({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') } 
      });
      
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check if user exists by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Método adicional para crear índices (útil para optimización)
  async createIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ personalIdentifier: 1 }, { unique: true });
      await collection.createIndex({ email: 1 }, { unique: true });
      await collection.createIndex({ phone: 1 });
      await collection.createIndex({ firstName: 1 });
      await collection.createIndex({ lastName: 1 });
      await collection.createIndex({ city: 1 });
      await collection.createIndex({ country: 1 });
      await collection.createIndex({ membershipType: 1 });
      await collection.createIndex({ active: 1 });
      
      console.log('✅ User collection indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating user indexes:', error);
      throw error;
    }
  }
}

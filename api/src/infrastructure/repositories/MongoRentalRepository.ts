import { Collection } from 'mongodb';
import { Rental, RentalStatus } from '../../domain/entities/Rental';
import { RentalRepository } from '../../domain/repositories/RentalRepository';
import { MongoConnection } from '../database/MongoConnection';

interface RentalDocument {
  _id?: string;
  id: string;
  userId: string;
  filmId: string;
  rentalDate: Date;
  expectedReturnDate: Date;
  actualReturnDate: Date | null;
  status: RentalStatus;
  rentalPrice: number;
  lateFee: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoRentalRepository implements RentalRepository {
  private readonly collectionName = 'rentals';
  private mongoConnection: MongoConnection;
  private indexesCreated = false;
  
  constructor() {
    this.mongoConnection = MongoConnection.getInstance();
  }

  private getCollection(): Collection<RentalDocument> {
    const db = this.mongoConnection.getDatabase();
    const collection = db.collection<RentalDocument>(this.collectionName);
    
    // Create indexes on first access
    if (!this.indexesCreated) {
      this.indexesCreated = true;
      this.createIndexes();
    }
    
    return collection;
  }

  private async createIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      
      // Primary queries indexes
      await collection.createIndex({ userId: 1 });
      await collection.createIndex({ filmId: 1 });
      await collection.createIndex({ status: 1 });
      
      // Composite indexes for common queries
      await collection.createIndex({ userId: 1, status: 1 });
      await collection.createIndex({ filmId: 1, status: 1 });
      await collection.createIndex({ userId: 1, filmId: 1 });
      
      // Date-based queries
      await collection.createIndex({ rentalDate: 1 });
      await collection.createIndex({ expectedReturnDate: 1 });
      await collection.createIndex({ actualReturnDate: 1 });
      
      // Overdue rentals query optimization
      await collection.createIndex({ status: 1, expectedReturnDate: 1 });
      
      console.log('📊 Rental collection indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating Rental indexes:', error);
    }
  }

  private rentalToDocument(rental: Rental): RentalDocument {
    return {
      id: rental.id,
      userId: rental.userId,
      filmId: rental.filmId,
      rentalDate: rental.rentalDate,
      expectedReturnDate: rental.expectedReturnDate,
      actualReturnDate: rental.actualReturnDate,
      status: rental.status,
      rentalPrice: rental.rentalPrice,
      lateFee: rental.lateFee,
      createdAt: rental.createdAt,
      updatedAt: rental.updatedAt
    };
  }

  private documentToRental(doc: RentalDocument): Rental {
    return new Rental(
      doc.id,
      doc.userId,
      doc.filmId,
      doc.rentalDate,
      doc.expectedReturnDate,
      doc.actualReturnDate,
      doc.status,
      doc.rentalPrice,
      doc.lateFee,
      doc.createdAt,
      doc.updatedAt
    );
  }

  // Basic CRUD operations
  async save(rental: Rental): Promise<Rental> {
    try {
      const document = this.rentalToDocument(rental);
      await this.getCollection().insertOne(document);
      console.log(`📦 Rental saved: ${rental.id}`);
      return rental;
    } catch (error) {
      console.error('❌ Error saving rental:', error);
      throw new Error('Failed to save rental');
    }
  }

  async update(rental: Rental): Promise<Rental> {
    try {
      const document = this.rentalToDocument(rental);
      const result = await this.getCollection().updateOne(
        { id: rental.id },
        { $set: document }
      );

      if (result.matchedCount === 0) {
        throw new Error('Rental not found');
      }

      console.log(`📝 Rental updated: ${rental.id}`);
      return rental;
    } catch (error) {
      console.error('❌ Error updating rental:', error);
      throw new Error('Failed to update rental');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.getCollection().deleteOne({ id });
      const deleted = result.deletedCount > 0;
      
      if (deleted) {
        console.log(`🗑️ Rental deleted: ${id}`);
      }
      
      return deleted;
    } catch (error) {
      console.error('❌ Error deleting rental:', error);
      throw new Error('Failed to delete rental');
    }
  }

  async findById(id: string): Promise<Rental | null> {
    try {
      const document = await this.getCollection().findOne({ id });
      return document ? this.documentToRental(document) : null;
    } catch (error) {
      console.error('❌ Error finding rental by ID:', error);
      throw new Error('Failed to find rental');
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Rental[]> {
    try {
      const documents = await this.getCollection()
        .find({})
        .sort({ rentalDate: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map(doc => this.documentToRental(doc));
    } catch (error) {
      console.error('❌ Error finding all rentals:', error);
      throw new Error('Failed to find rentals');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.getCollection().countDocuments({ id });
      return count > 0;
    } catch (error) {
      console.error('❌ Error checking rental existence:', error);
      throw new Error('Failed to check rental existence');
    }
  }

  // User-related queries
  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Rental[]> {
    try {
      const documents = await this.getCollection()
        .find({ userId })
        .sort({ rentalDate: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map(doc => this.documentToRental(doc));
    } catch (error) {
      console.error('❌ Error finding rentals by user ID:', error);
      throw new Error('Failed to find user rentals');
    }
  }

  async findActiveRentalsByUserId(userId: string): Promise<Rental[]> {
    try {
      const documents = await this.getCollection()
        .find({ userId, status: RentalStatus.ACTIVE })
        .sort({ rentalDate: -1 })
        .toArray();

      return documents.map(doc => this.documentToRental(doc));
    } catch (error) {
      console.error('❌ Error finding active rentals by user ID:', error);
      throw new Error('Failed to find active user rentals');
    }
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      return await this.getCollection().countDocuments({ userId });
    } catch (error) {
      console.error('❌ Error counting rentals by user ID:', error);
      throw new Error('Failed to count user rentals');
    }
  }

  // Film-related queries
  async findByFilmId(filmId: string, limit: number = 50, offset: number = 0): Promise<Rental[]> {
    try {
      const documents = await this.getCollection()
        .find({ filmId })
        .sort({ rentalDate: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map(doc => this.documentToRental(doc));
    } catch (error) {
      console.error('❌ Error finding rentals by film ID:', error);
      throw new Error('Failed to find film rentals');
    }
  }

  async findActiveRentalsByFilmId(filmId: string): Promise<Rental[]> {
    try {
      const documents = await this.getCollection()
        .find({ filmId, status: RentalStatus.ACTIVE })
        .sort({ rentalDate: -1 })
        .toArray();

      return documents.map(doc => this.documentToRental(doc));
    } catch (error) {
      console.error('❌ Error finding active rentals by film ID:', error);
      throw new Error('Failed to find active film rentals');
    }
  }

  async countByFilmId(filmId: string): Promise<number> {
    try {
      return await this.getCollection().countDocuments({ filmId });
    } catch (error) {
      console.error('❌ Error counting rentals by film ID:', error);
      throw new Error('Failed to count film rentals');
    }
  }

  // Status-based queries
  async findByStatus(status: RentalStatus, limit: number = 50, offset: number = 0): Promise<Rental[]> {
    try {
      const documents = await this.getCollection()
        .find({ status })
        .sort({ rentalDate: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map(doc => this.documentToRental(doc));
    } catch (error) {
      console.error('❌ Error finding rentals by status:', error);
      throw new Error('Failed to find rentals by status');
    }
  }

  async findOverdueRentals(): Promise<Rental[]> {
    try {
      const now = new Date();
      const documents = await this.getCollection()
        .find({ 
          status: RentalStatus.ACTIVE,
          expectedReturnDate: { $lt: now }
        })
        .sort({ expectedReturnDate: 1 })
        .toArray();

      return documents.map(doc => this.documentToRental(doc));
    } catch (error) {
      console.error('❌ Error finding overdue rentals:', error);
      throw new Error('Failed to find overdue rentals');
    }
  }

  async countByStatus(status: RentalStatus): Promise<number> {
    try {
      return await this.getCollection().countDocuments({ status });
    } catch (error) {
      console.error('❌ Error counting rentals by status:', error);
      throw new Error('Failed to count rentals by status');
    }
  }

  // Business queries
  async findUserFilmRental(userId: string, filmId: string): Promise<Rental | null> {
    try {
      const document = await this.getCollection()
        .findOne(
          { userId, filmId },
          { sort: { rentalDate: -1 } }
        );

      return document ? this.documentToRental(document) : null;
    } catch (error) {
      console.error('❌ Error finding user-film rental:', error);
      throw new Error('Failed to find user-film rental');
    }
  }

  async findActiveUserFilmRental(userId: string, filmId: string): Promise<Rental | null> {
    try {
      const document = await this.getCollection().findOne({
        userId,
        filmId,
        status: RentalStatus.ACTIVE
      });

      return document ? this.documentToRental(document) : null;
    } catch (error) {
      console.error('❌ Error finding active user-film rental:', error);
      throw new Error('Failed to find active user-film rental');
    }
  }

  // Analytics queries
  async getTotalRevenue(): Promise<number> {
    try {
      const result = await this.getCollection().aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { 
              $sum: { $add: ['$rentalPrice', '$lateFee'] }
            }
          }
        }
      ]).toArray();

      return result[0]?.totalRevenue || 0;
    } catch (error) {
      console.error('❌ Error calculating total revenue:', error);
      throw new Error('Failed to calculate total revenue');
    }
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await this.getCollection().aggregate([
        {
          $match: {
            rentalDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { 
              $sum: { $add: ['$rentalPrice', '$lateFee'] }
            }
          }
        }
      ]).toArray();

      return result[0]?.totalRevenue || 0;
    } catch (error) {
      console.error('❌ Error calculating revenue by date range:', error);
      throw new Error('Failed to calculate revenue by date range');
    }
  }

  async getMostRentedFilms(limit: number = 10): Promise<Array<{ filmId: string; count: number }>> {
    try {
      const result = await this.getCollection().aggregate([
        {
          $group: {
            _id: '$filmId',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            filmId: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]).toArray();

      return result as Array<{ filmId: string; count: number }>;
    } catch (error) {
      console.error('❌ Error getting most rented films:', error);
      throw new Error('Failed to get most rented films');
    }
  }

  async getMostActiveUsers(limit: number = 10): Promise<Array<{ userId: string; count: number }>> {
    try {
      const result = await this.getCollection().aggregate([
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            userId: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]).toArray();

      return result as Array<{ userId: string; count: number }>;
    } catch (error) {
      console.error('❌ Error getting most active users:', error);
      throw new Error('Failed to get most active users');
    }
  }

  // Rental history
  async getRentalHistory(limit: number = 50, offset: number = 0): Promise<{
    rentals: Rental[];
    totalCount: number;
  }> {
    try {
      const [rentals, totalCount] = await Promise.all([
        this.findAll(limit, offset),
        this.getCollection().countDocuments({})
      ]);

      return { rentals, totalCount };
    } catch (error) {
      console.error('❌ Error getting rental history:', error);
      throw new Error('Failed to get rental history');
    }
  }
}

import { Collection } from 'mongodb';
import { UserAuditRepository } from '../../domain/repositories/UserAuditRepository';
import { UserAuditLog, UserAuditLogEntity, FieldChange } from '../../domain/entities/UserAuditLog';
import { MongoConnection } from '../database/MongoConnection';
import { v4 as uuidv4 } from 'uuid';

interface UserAuditLogDocument {
  _id?: string;
  id: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    dataType: string;
  }[];
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    performedBy?: string;
  };
}

export class MongoUserAuditRepository implements UserAuditRepository {
  private readonly collectionName = 'userAuditLogs';
  private mongoConnection: MongoConnection;
  private indexesCreated = false;
  
  constructor() {
    this.mongoConnection = MongoConnection.getInstance();
  }

  private getCollection(): Collection<UserAuditLogDocument> {
    const db = this.mongoConnection.getDatabase();
    const collection = db.collection<UserAuditLogDocument>(this.collectionName);
    
    // Create indexes on first access
    if (!this.indexesCreated) {
      this.indexesCreated = true; // Set before calling to prevent recursion
      this.createIndexes();
    }
    
    return collection;
  }

  private mapDocumentToEntity(doc: UserAuditLogDocument): UserAuditLogEntity {
    const changes: FieldChange[] = doc.changes.map(change => ({
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      dataType: change.dataType as 'string' | 'number' | 'boolean' | 'date' | 'object'
    }));

    return new UserAuditLogEntity(
      doc.id,
      doc.userId,
      doc.action,
      doc.timestamp,
      changes,
      doc.metadata
    );
  }

  private async createIndexes(): Promise<void> {
    try {
      const db = this.mongoConnection.getDatabase();
      const collection = db.collection<UserAuditLogDocument>(this.collectionName);
      
      // Index for efficient queries by userId
      await collection.createIndex({ userId: 1 });
      
      // Index for queries by userId and timestamp (for chronological order)
      await collection.createIndex({ userId: 1, timestamp: -1 });
      
      // Index for queries by userId and action
      await collection.createIndex({ userId: 1, action: 1 });
      
      // Index for date range queries
      await collection.createIndex({ userId: 1, timestamp: 1 });
      
      // TTL index for automatic cleanup (optional - 2 years retention)
      await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years
      
      console.log('📊 UserAuditLog indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating UserAuditLog indexes:', error);
    }
  }

  async save(auditLog: UserAuditLog): Promise<UserAuditLog> {
    try {
      const document: UserAuditLogDocument = {
        id: auditLog.id || uuidv4(),
        userId: auditLog.userId,
        action: auditLog.action,
        timestamp: auditLog.timestamp,
        changes: auditLog.changes.map(change => ({
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          dataType: change.dataType
        })),
        metadata: auditLog.metadata
      };

      const result = await this.getCollection().insertOne(document);
      
      if (!result.acknowledged) {
        throw new Error('Failed to save audit log');
      }

      return this.mapDocumentToEntity(document);
    } catch (error) {
      console.error('❌ Error saving audit log:', error);
      throw new Error('Failed to save audit log');
    }
  }

  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<UserAuditLog[]> {
    try {
      const documents = await this.getCollection()
        .find({ userId })
        .sort({ timestamp: -1 }) // Most recent first
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map((doc: UserAuditLogDocument) => this.mapDocumentToEntity(doc));
    } catch (error) {
      console.error('❌ Error finding audit logs by userId:', error);
      throw new Error('Failed to retrieve audit logs');
    }
  }

  async findByUserIdAndAction(userId: string, action: 'CREATE' | 'UPDATE' | 'DELETE'): Promise<UserAuditLog[]> {
    try {
      const documents = await this.getCollection()
        .find({ userId, action })
        .sort({ timestamp: -1 })
        .toArray();

      return documents.map((doc: UserAuditLogDocument) => this.mapDocumentToEntity(doc));
    } catch (error) {
      console.error('❌ Error finding audit logs by action:', error);
      throw new Error('Failed to retrieve audit logs');
    }
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<UserAuditLog[]> {
    try {
      const documents = await this.getCollection()
        .find({
          userId,
          timestamp: {
            $gte: startDate,
            $lte: endDate
          }
        })
        .sort({ timestamp: -1 })
        .toArray();

      return documents.map((doc: UserAuditLogDocument) => this.mapDocumentToEntity(doc));
    } catch (error) {
      console.error('❌ Error finding audit logs by date range:', error);
      throw new Error('Failed to retrieve audit logs');
    }
  }

  async getAuditCount(userId: string): Promise<number> {
    try {
      return await this.getCollection().countDocuments({ userId });
    } catch (error) {
      console.error('❌ Error counting audit logs:', error);
      throw new Error('Failed to count audit logs');
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await this.getCollection().deleteMany({ userId });
    } catch (error) {
      console.error('❌ Error deleting audit logs:', error);
      throw new Error('Failed to delete audit logs');
    }
  }

  // Additional helper methods for advanced queries

  async getLatestActionByType(userId: string, action: 'CREATE' | 'UPDATE' | 'DELETE'): Promise<UserAuditLog | null> {
    try {
      const document = await this.getCollection()
        .findOne(
          { userId, action },
          { sort: { timestamp: -1 } }
        );

      if (!document) {
        return null;
      }

      return this.mapDocumentToEntity(document);
    } catch (error) {
      console.error('❌ Error finding latest action:', error);
      throw new Error('Failed to retrieve latest action');
    }
  }

  async getFieldHistory(userId: string, fieldName: string): Promise<FieldChange[]> {
    try {
      const documents = await this.getCollection()
        .find(
          { 
            userId,
            'changes.field': fieldName
          },
          {
            sort: { timestamp: -1 }
          }
        )
        .toArray();

      const fieldChanges: FieldChange[] = [];
      
      for (const doc of documents) {
        const fieldChange = doc.changes.find((change: any) => change.field === fieldName);
        if (fieldChange) {
          fieldChanges.push({
            field: fieldChange.field,
            oldValue: fieldChange.oldValue,
            newValue: fieldChange.newValue,
            dataType: fieldChange.dataType as 'string' | 'number' | 'boolean' | 'date' | 'object'
          });
        }
      }

      return fieldChanges;
    } catch (error) {
      console.error('❌ Error getting field history:', error);
      throw new Error('Failed to retrieve field history');
    }
  }
}

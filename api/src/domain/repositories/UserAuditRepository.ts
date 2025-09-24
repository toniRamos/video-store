import { UserAuditLog } from '../entities/UserAuditLog';

import { FieldChange } from '../entities/UserAuditLog';

export interface UserAuditRepository {
  save(auditLog: UserAuditLog): Promise<UserAuditLog>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<UserAuditLog[]>;
  findByUserIdAndAction(userId: string, action: 'CREATE' | 'UPDATE' | 'DELETE'): Promise<UserAuditLog[]>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<UserAuditLog[]>;
  getAuditCount(userId: string): Promise<number>;
  deleteByUserId(userId: string): Promise<void>;
  getFieldHistory(userId: string, fieldName: string): Promise<FieldChange[]>;
}

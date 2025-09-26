export interface FieldChange {
  field: string;
  fieldKey: string;
  oldValue: string;
  newValue: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object';
}

export interface AuditLogEntry {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: string;
  changesSummary: string;
  changes: FieldChange[];
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    performedBy?: string;
  };
  // User information (populated in global history queries)
  userName?: string;
  userDni?: string | null;
}

export interface UserHistoryResponse {
  message: string;
  data: {
    userId: string;
    totalCount: number;
    limit: number;
    offset: number;
    filters: {
      action: string | null;
    };
    history: AuditLogEntry[];
  };
}

export interface HistorySummaryResponse {
  message: string;
  data: {
    userId: string;
    totalEvents: number;
    actionCounts: {
      CREATE: number;
      UPDATE: number;
      DELETE: number;
    };
    lastActivity: {
      action: string;
      timestamp: string;
      changesSummary: string;
    } | null;
    recentEvents: number;
    hasHistory: boolean;
  };
}

export interface FieldHistoryResponse {
  success: boolean;
  data: {
    userId: string;
    fieldName: string;
    changes: FieldChange[];
    totalChanges: number;
  };
}

export interface GlobalHistorySummaryResponse {
  success: boolean;
  data: {
    totalEvents: number;
    totalUsers: number;
    actionCounts: {
      CREATE: number;
      UPDATE: number;
      DELETE: number;
    };
    userSummaries: Array<{
      userId: string;
      userName: string;
      eventCount: number;
      lastActivity: string;
    }>;
  };
}

const BASE_URL = 'http://localhost:3001/api/users';

export const auditService = {
  /**
   * Get complete audit history for a user
   */
  async getUserHistory(userId: string, limit: number = 10, offset: number = 0): Promise<UserHistoryResponse> {
    try {
      const response = await fetch(`${BASE_URL}/${userId}/history?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  },

  /**
   * Get audit history summary for a user
   */
  async getHistorySummary(userId: string): Promise<HistorySummaryResponse> {
    try {
      const response = await fetch(`${BASE_URL}/${userId}/history/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching history summary:', error);
      throw error;
    }
  },

  /**
   * Get history for a specific field
   */
  async getFieldHistory(userId: string, fieldName: string): Promise<FieldHistoryResponse> {
    try {
      const response = await fetch(`${BASE_URL}/${userId}/history/field/${fieldName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching field history:', error);
      throw error;
    }
  },

  /**
   * Get recent audit logs across all users (for admin dashboard)
   */
  async getAllRecentAudits(limit: number = 10): Promise<AuditLogEntry[]> {
    // This would require a new endpoint, for now we'll return empty
    // Could be implemented as /api/audit/recent
    return [];
  },

  /**
   * Get global history across all users
   */
  async getGlobalHistory(limit: number = 10, offset: number = 0): Promise<UserHistoryResponse> {
    try {
      const response = await fetch(`http://localhost:3001/api/history?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching global history:', error);
      throw error;
    }
  },

  /**
   * Get global history summary with user statistics
   */
  async getGlobalHistorySummary(): Promise<GlobalHistorySummaryResponse> {
    try {
      const response = await fetch('http://localhost:3001/api/history/summary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching global history summary:', error);
      throw error;
    }
  }
};

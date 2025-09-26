export interface UserAuditLog {
  id: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: Date;
  changes: FieldChange[];
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    performedBy?: string; // Future: quien hizo el cambio
  };
  // Optional user information (populated in some queries)
  userName?: string;
  userDni?: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object';
}

export class UserAuditLogEntity implements UserAuditLog {
  constructor(
    public id: string,
    public userId: string,
    public action: 'CREATE' | 'UPDATE' | 'DELETE',
    public timestamp: Date,
    public changes: FieldChange[],
    public metadata?: {
      userAgent?: string;
      ipAddress?: string;
      performedBy?: string;
    }
  ) {}

  static create(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    changes: FieldChange[],
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
      performedBy?: string;
    }
  ): UserAuditLogEntity {
    return new UserAuditLogEntity(
      '', // Will be set by repository
      userId,
      action,
      new Date(),
      changes,
      metadata
    );
  }

  // Helper method to format changes for display
  getChangesSummary(): string {
    if (this.action === 'CREATE') {
      return 'Usuario creado';
    }
    
    if (this.action === 'DELETE') {
      return 'Usuario eliminado';
    }

    const changedFields = this.changes.map(change => change.field).join(', ');
    return `Campos modificados: ${changedFields}`;
  }

  // Helper method to get human-readable field names
  getFieldDisplayName(fieldName: string): string {
    const fieldMappings: { [key: string]: string } = {
      'personalIdentifier': 'Identificador Personal',
      'firstName': 'Nombre',
      'lastName': 'Apellidos',
      'email': 'Email',
      'phone': 'Teléfono',
      'address': 'Dirección',
      'city': 'Ciudad',
      'postalCode': 'Código Postal',
      'country': 'País',
      'dateOfBirth': 'Fecha de Nacimiento',
      'membershipType': 'Tipo de Membresía',
      'active': 'Estado Activo'
    };

    return fieldMappings[fieldName] || fieldName;
  }

  // Helper method to format values for display
  formatValue(value: any, dataType: string): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    switch (dataType) {
      case 'date':
        return new Date(value).toLocaleDateString('es-ES');
      case 'boolean':
        return value ? 'Sí' : 'No';
      case 'object':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }
}

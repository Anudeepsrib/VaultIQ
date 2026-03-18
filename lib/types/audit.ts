export type AuditAction =
  | 'UPLOAD'
  | 'EXTRACT'
  | 'QUERY'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'ROLE_CHANGE'
  | 'BENCHMARK_RUN'
  | 'SETTINGS_CHANGE';

export type AuditStatus = 'success' | 'failed';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  action: AuditAction;
  resource: {
    type: string;
    id?: string;
    name?: string;
  };
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  status: AuditStatus;
  errorMessage?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
  status?: AuditStatus;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  filters: AuditLogFilters;
}

import apiClient from './client';
import { AuditLogResponse, AuditLogFilters, AuditLogEntry } from '@/lib/types/audit';

export async function getAuditLogs(
  filters: AuditLogFilters = {},
  page = 1,
  pageSize = 25
): Promise<AuditLogResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);

  const response = await apiClient.get<AuditLogResponse>(`/audit?${params}`);
  return response.data;
}

export async function exportAuditLogs(filters: AuditLogFilters = {}): Promise<Blob> {
  const params = new URLSearchParams();

  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);

  const response = await apiClient.get(`/audit/export?${params}`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function getAuditLogEntry(id: string): Promise<AuditLogEntry> {
  const response = await apiClient.get<AuditLogEntry>(`/audit/${id}`);
  return response.data;
}

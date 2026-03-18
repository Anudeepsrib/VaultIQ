'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAuditLogs, exportAuditLogs } from '@/lib/api/audit';
import { AuditLogResponse, AuditLogFilters, AuditLogEntry } from '@/lib/types/audit';

export function useAuditLogs(
  filters: AuditLogFilters = {},
  page = 1,
  pageSize = 25
) {
  return useQuery<AuditLogResponse>({
    queryKey: ['audit', 'logs', filters, page, pageSize],
    queryFn: () => getAuditLogs(filters, page, pageSize),
    staleTime: 0, // Always fresh for audit logs
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async (filters: AuditLogFilters = {}) => {
      const blob = await exportAuditLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Audit log exported');
    },
    onError: (error: Error) => {
      toast.error('Export failed', {
        description: error.message,
      });
    },
  });
}

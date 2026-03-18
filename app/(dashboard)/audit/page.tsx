'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { permissions } from '@/lib/utils/permissions';
import { useAuditLogs, useExportAuditLogs } from '@/lib/hooks/useAuditLogs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Loader2, Download, ClipboardList } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { AuditAction, AuditStatus, AuditLogEntry } from '@/lib/types/audit';

const actionColors: Record<AuditAction, string> = {
  UPLOAD: 'bg-info/20 text-info',
  EXTRACT: 'bg-purple-500/20 text-purple-400',
  QUERY: 'bg-teal-500/20 text-teal-400',
  DELETE: 'bg-error/20 text-error',
  LOGIN: 'bg-text-tertiary/20 text-text-tertiary',
  LOGOUT: 'bg-text-tertiary/20 text-text-tertiary',
  USER_CREATE: 'bg-success/20 text-success',
  USER_UPDATE: 'bg-warning/20 text-warning',
  ROLE_CHANGE: 'bg-accent/20 text-accent',
  BENCHMARK_RUN: 'bg-blue-500/20 text-blue-400',
  SETTINGS_CHANGE: 'bg-text-secondary/20 text-text-secondary',
};

export default function AuditPage() {
  const { role } = useAuthStore();
  const canExport = role ? permissions.canExportAuditCSV(role) : false;

  const { data, isLoading } = useAuditLogs();
  const exportLogs = useExportAuditLogs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const entries = data?.entries || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all system activities and user actions"
      >
        {canExport && (
          <Button
            onClick={() => exportLogs.mutate()}
            disabled={exportLogs.isPending}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-surface border border-border rounded-lg p-4">
        <Input placeholder="Filter by user..." className="w-48" />
        <Select>
          <SelectTrigger className="w-40 bg-surface border-border">
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="UPLOAD">Upload</SelectItem>
            <SelectItem value="EXTRACT">Extract</SelectItem>
            <SelectItem value="QUERY">Query</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" placeholder="From" className="w-40" />
        <Input type="date" placeholder="To" className="w-40" />
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-raised/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Timestamp</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">User</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Action</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Resource</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <ClipboardList className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
                  <p className="text-text-secondary">No audit entries found</p>
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={cn(
                    'border-b border-border last:border-0 hover:bg-surface-raised/50',
                    index % 2 === 1 && 'bg-surface-raised/20'
                  )}
                >
                  <td className="py-3 px-4 font-mono text-sm text-text-secondary">
                    {formatDateTime(entry.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-text-primary">{entry.user.name}</p>
                      <p className="text-xs text-text-tertiary capitalize">{entry.user.role}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('px-2 py-1 rounded text-xs font-medium uppercase', actionColors[entry.action])}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {entry.resource.type}
                    {entry.resource.name && `: ${entry.resource.name}`}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'flex items-center gap-1.5 text-sm',
                      entry.status === 'success' ? 'text-success' : 'text-error'
                    )}>
                      <span className={cn('h-2 w-2 rounded-full', entry.status === 'success' ? 'bg-success' : 'bg-error')} />
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Document, DocumentStatus } from '@/lib/types/document';
import { formatDate, formatBytes } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { FileText, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config: Record<DocumentStatus, { icon: React.ComponentType<{ className?: string }>; label: string; className: string }> = {
    processing: {
      icon: Loader2,
      label: 'Processing',
      className: 'text-info bg-info/10',
    },
    ready: {
      icon: CheckCircle2,
      label: 'Ready',
      className: 'text-success bg-success/10',
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      className: 'text-error bg-error/10',
    },
    partial: {
      icon: AlertCircle,
      label: 'Partial',
      className: 'text-warning bg-warning/10',
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', className)}>
      <Icon className={cn('h-3.5 w-3.5', status === 'processing' && 'animate-spin')} />
      {label}
    </span>
  );
}

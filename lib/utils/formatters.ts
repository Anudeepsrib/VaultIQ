import { format, parseISO } from 'date-fns';

export function formatCurrency(
  value: number | null | undefined,
  options: { currency?: string; locale?: string } = {}
): string {
  const { currency = 'USD', locale = 'en-US' } = options;

  if (value === null || value === undefined) {
    return '—';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(
  value: number | null | undefined,
  options: { decimals?: number; compact?: boolean } = {}
): string {
  const { decimals = 2, compact = false } = options;

  if (value === null || value === undefined) {
    return '—';
  }

  if (compact && Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }

  if (compact && Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(
  value: string | Date | null | undefined,
  formatStr = 'MMM d, yyyy'
): string {
  if (!value) {
    return '—';
  }

  try {
    const date = typeof value === 'string' ? parseISO(value) : value;
    return format(date, formatStr);
  } catch {
    return String(value);
  }
}

export function formatDateTime(
  value: string | Date | null | undefined
): string {
  if (!value) {
    return '—';
  }

  try {
    const date = typeof value === 'string' ? parseISO(value) : value;
    return format(date, 'MMM d, yyyy h:mm:ss a');
  } catch {
    return String(value);
  }
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '—';
  }

  try {
    const date = typeof value === 'string' ? parseISO(value) : value;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }

    return formatDate(value);
  } catch {
    return String(value);
  }
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

export function formatPercentage(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value === null || value === undefined) {
    return '—';
  }

  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) {
    return '—';
  }

  if (ms < 1000) {
    return `${ms}ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DataCardProps {
  label: string;
  value: string;
  delta?: number;
  className?: string;
}

export function DataCard({ label, value, delta, className }: DataCardProps) {
  const isPositive = delta && delta > 0;
  const isNegative = delta && delta < 0;

  return (
    <div className={cn('bg-surface border border-border rounded-lg p-4', className)}>
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-mono font-semibold text-text-primary">{value}</p>
      {delta !== undefined && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-xs',
          isPositive && 'text-success',
          isNegative && 'text-error',
          !isPositive && !isNegative && 'text-text-tertiary'
        )}>
          {isPositive && <TrendingUp className="h-3 w-3" />}
          {isNegative && <TrendingDown className="h-3 w-3" />}
          <span>{isPositive ? '+' : ''}{delta.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}

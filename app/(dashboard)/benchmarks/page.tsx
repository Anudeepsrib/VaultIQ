'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { permissions } from '@/lib/utils/permissions';
import { useBenchmarks, useBenchmarkComparison, useRunBenchmark } from '@/lib/hooks/useBenchmarks';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataCard } from '@/components/ui/DataCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader2, Play, BarChart3 } from 'lucide-react';
import { formatNumber, formatDateTime, formatDuration } from '@/lib/utils/formatters';

export default function BenchmarksPage() {
  const { role } = useAuthStore();
  const canRunBenchmark = role ? permissions.canRunBenchmark(role) : false;

  const { data: benchmarks, isLoading: isLoadingHistory } = useBenchmarks();
  const { data: comparison, isLoading: isLoadingComparison } = useBenchmarkComparison();
  const runBenchmark = useRunBenchmark();

  const isLoading = isLoadingHistory || isLoadingComparison;
  const latestRun = benchmarks?.runs?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Benchmarks"
        description="Compare model performance and run extraction benchmarks"
      >
        {canRunBenchmark && (
          <Button
            onClick={() => runBenchmark.mutate()}
            disabled={runBenchmark.isPending}
            className="bg-accent hover:bg-accent-hover text-background"
          >
            {runBenchmark.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Benchmark
          </Button>
        )}
      </PageHeader>

      {latestRun ? (
        <>
          {/* Top metrics */}
          <div className="grid grid-cols-3 gap-4">
            <DataCard
              label="Latest Tokens/sec"
              value={formatNumber(latestRun.metrics.tokensPerSecond, { decimals: 1 })}
            />
            <DataCard
              label="Latest TTFT"
              value={formatDuration(latestRun.metrics.ttftMs)}
            />
            <DataCard
              label="Last Run"
              value={formatDateTime(latestRun.runAt)}
            />
          </div>

          {/* Model Comparison Table */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Model Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Model</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary uppercase">Tokens/sec</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary uppercase">TTFT</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary uppercase">Peak Memory</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary uppercase">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison?.summary && Object.entries(comparison.summary).map(([model, stats]) => (
                    <tr key={model} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-mono text-text-primary uppercase">{model}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatNumber(stats.avgTokensPerSecond, { decimals: 1 })}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatDuration(stats.avgTtftMs)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatNumber(stats.avgPeakMemoryMb, { decimals: 0 })} MB</td>
                      <td className="py-3 px-4 text-right font-mono">{formatNumber(stats.avgExtractionAccuracy, { decimals: 1 })}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No benchmarks yet"
          description="Run your first benchmark to compare model performance."
          action={
            canRunBenchmark && (
              <Button
                onClick={() => runBenchmark.mutate()}
                disabled={runBenchmark.isPending}
                className="bg-accent hover:bg-accent-hover text-background"
              >
                <Play className="h-4 w-4 mr-2" />
                Run First Benchmark
              </Button>
            )
          }
        />
      )}
    </div>
  );
}

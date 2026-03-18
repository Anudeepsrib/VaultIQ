'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  runBenchmark,
  getBenchmarks,
  getBenchmarkComparison,
  getBenchmarkStatus,
} from '@/lib/api/benchmarks';
import {
  BenchmarkRun,
  BenchmarkComparison,
  BenchmarkHistoryResponse,
  BenchmarkRunRequest,
} from '@/lib/types/benchmark';

export function useBenchmarks(page = 1, pageSize = 25) {
  return useQuery<BenchmarkHistoryResponse>({
    queryKey: ['benchmarks', 'history', page, pageSize],
    queryFn: () => getBenchmarks(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBenchmarkComparison() {
  return useQuery<BenchmarkComparison>({
    queryKey: ['benchmarks', 'comparison'],
    queryFn: getBenchmarkComparison,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRunBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BenchmarkRunRequest = {}) => runBenchmark(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benchmarks'] });
      toast.success('Benchmark started', {
        description: 'The benchmark run has been initiated.',
      });
    },
    onError: (error: Error) => {
      toast.error('Benchmark failed', {
        description: error.message,
      });
    },
  });
}

export function useBenchmarkStatus(runId: string) {
  return useQuery<BenchmarkRun>({
    queryKey: ['benchmarks', 'status', runId],
    queryFn: () => getBenchmarkStatus(runId),
    enabled: !!runId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'running') {
        return 5000; // Poll every 5 seconds while running
      }
      return false;
    },
  });
}

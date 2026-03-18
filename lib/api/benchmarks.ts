import apiClient from './client';
import {
  BenchmarkRun,
  BenchmarkComparison,
  BenchmarkHistoryResponse,
  BenchmarkRunRequest,
} from '@/lib/types/benchmark';

export async function runBenchmark(
  request: BenchmarkRunRequest = {}
): Promise<BenchmarkRun> {
  const response = await apiClient.post<BenchmarkRun>('/benchmarks/run', request);
  return response.data;
}

export async function getBenchmarks(
  page = 1,
  pageSize = 25
): Promise<BenchmarkHistoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const response = await apiClient.get<BenchmarkHistoryResponse>(`/benchmarks?${params}`);
  return response.data;
}

export async function getBenchmarkComparison(): Promise<BenchmarkComparison> {
  const response = await apiClient.get<BenchmarkComparison>('/benchmarks/compare');
  return response.data;
}

export async function getBenchmarkStatus(runId: string): Promise<BenchmarkRun> {
  const response = await apiClient.get<BenchmarkRun>(`/benchmarks/${runId}/status`);
  return response.data;
}

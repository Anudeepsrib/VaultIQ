export type BenchmarkModel = 'phi4' | 'llama3.2' | 'mistral';

export interface BenchmarkMetrics {
  tokensPerSecond: number;
  ttftMs: number; // Time To First Token
  totalLatencyMs: number;
  peakMemoryMb: number;
  extractionAccuracy: number; // 0-100
  jsonValidityRate: number; // 0-100
}

export interface BenchmarkRun {
  id: string;
  model: BenchmarkModel;
  metrics: BenchmarkMetrics;
  runAt: string;
  runBy: {
    id: string;
    name: string;
  };
  documentCount: number;
  status: 'running' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface BenchmarkComparison {
  models: BenchmarkModel[];
  runs: BenchmarkRun[];
  summary: Record<
    BenchmarkModel,
    {
      avgTokensPerSecond: number;
      avgTtftMs: number;
      avgTotalLatencyMs: number;
      avgPeakMemoryMb: number;
      avgExtractionAccuracy: number;
      avgJsonValidityRate: number;
      runCount: number;
    }
  >;
}

export interface BenchmarkHistoryResponse {
  runs: BenchmarkRun[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BenchmarkRunRequest {
  models?: BenchmarkModel[];
  documentCount?: number;
}

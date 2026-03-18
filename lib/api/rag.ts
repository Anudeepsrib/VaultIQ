import apiClient from './client';

export interface RAGQueryRequest {
  query: string;
  model?: string;
  documentIds?: string[];
}

export interface SourceChunk {
  documentId: string;
  documentName: string;
  pageNumber: number;
  chunkText: string;
  relevanceScore: number;
}

export interface RAGQueryResponse {
  answer: string;
  sources: SourceChunk[];
  model: string;
  queryTime: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export async function queryRag(request: RAGQueryRequest): Promise<RAGQueryResponse> {
  const response = await apiClient.post<RAGQueryResponse>('/rag/query', request);
  return response.data;
}

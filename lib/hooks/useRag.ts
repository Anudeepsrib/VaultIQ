'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryRag } from '@/lib/api/rag';
import { useQueryStore } from '@/lib/stores/queryStore';
import { RAGQueryRequest, RAGQueryResponse } from '@/lib/api/rag';

export function useRagQuery() {
  const { addToHistory } = useQueryStore();

  return useMutation({
    mutationFn: async (request: RAGQueryRequest): Promise<RAGQueryResponse> => {
      const response = await queryRag(request);
      return response;
    },
    onSuccess: (data, variables) => {
      addToHistory({
        query: variables.query,
        model: data.model,
        answerPreview: data.answer.slice(0, 100) + (data.answer.length > 100 ? '...' : ''),
      });
    },
    onError: (error: Error) => {
      toast.error('Query failed', {
        description: error.message,
      });
    },
  });
}

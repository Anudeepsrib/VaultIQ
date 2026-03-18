'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getExtraction, extractDocument } from '@/lib/api/extraction';
import { ExtractionResponse, ExtractionRequest } from '@/lib/types/extraction';

export function useExtraction(documentId: string) {
  return useQuery<ExtractionResponse>({
    queryKey: ['extraction', documentId],
    queryFn: () => getExtraction(documentId),
    enabled: !!documentId,
    staleTime: 30 * 1000,
  });
}

export function useExtractDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, ...options }: ExtractionRequest) => {
      const response = await extractDocument(documentId, options);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['extraction', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents', variables.documentId] });
      toast.success('Extraction completed', {
        description: 'Document has been re-extracted successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Extraction failed', {
        description: error.message,
      });
    },
  });
}

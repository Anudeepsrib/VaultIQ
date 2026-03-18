'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getDocuments,
  getDocument,
  uploadDocument,
  deleteDocument,
} from '@/lib/api/documents';
import { Document, DocumentListResponse } from '@/lib/types/document';

export function useDocuments(page = 1, pageSize = 25, search?: string) {
  return useQuery<DocumentListResponse>({
    queryKey: ['documents', page, pageSize, search],
    queryFn: () => getDocuments(page, pageSize, search),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useDocument(id: string) {
  return useQuery<Document>({
    queryKey: ['documents', id],
    queryFn: () => getDocument(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded', {
        description: 'Your document is being processed.',
      });
    },
    onError: (error: Error) => {
      toast.error('Upload failed', {
        description: error.message,
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
    },
    onError: (error: Error) => {
      toast.error('Delete failed', {
        description: error.message,
      });
    },
  });
}

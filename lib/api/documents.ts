import apiClient from './client';
import {
  Document,
  DocumentListResponse,
  DocumentUploadResponse,
} from '@/lib/types/document';

export async function getDocuments(
  page = 1,
  pageSize = 25,
  search?: string
): Promise<DocumentListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.append('search', search);

  const response = await apiClient.get<DocumentListResponse>(`/documents?${params}`);
  return response.data;
}

export async function getDocument(id: string): Promise<Document> {
  const response = await apiClient.get<Document>(`/documents/${id}`);
  return response.data;
}

export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<DocumentUploadResponse>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = progressEvent.total
        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
        : 0;
      // Progress can be tracked via a callback if needed
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
  return response.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}

export async function downloadDocument(id: string): Promise<Blob> {
  const response = await apiClient.get(`/documents/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

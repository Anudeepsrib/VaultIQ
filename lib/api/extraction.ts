import apiClient from './client';
import { ExtractionResponse, ExtractionRequest } from '@/lib/types/extraction';

export async function getExtraction(documentId: string): Promise<ExtractionResponse> {
  const response = await apiClient.get<ExtractionResponse>(`/documents/${documentId}/extraction`);
  return response.data;
}

export async function extractDocument(
  documentId: string,
  options?: Omit<ExtractionRequest, 'documentId'>
): Promise<ExtractionResponse> {
  const response = await apiClient.post<ExtractionResponse>(`/documents/${documentId}/extract`, options);
  return response.data;
}

export async function downloadExtractionJson(documentId: string): Promise<Blob> {
  const response = await apiClient.get(`/documents/${documentId}/extraction/download`, {
    responseType: 'blob',
  });
  return response.data;
}

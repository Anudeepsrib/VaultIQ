export type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'csv';
export type DocumentStatus = 'processing' | 'ready' | 'failed' | 'partial';
export type ExtractionModel = 'phi4' | 'llama3.2' | 'mistral';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  pages: number;
  status: DocumentStatus;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
  hasPII: boolean;
  modelUsed?: ExtractionModel;
  extractionCompletedAt?: string;
}

export interface DocumentUploadRequest {
  file: File;
}

export interface DocumentUploadResponse {
  id: string;
  status: DocumentStatus;
  message: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
}

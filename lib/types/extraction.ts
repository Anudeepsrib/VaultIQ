export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractedField {
  label: string;
  value: string | number | null;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  sourcePage?: number;
  isMonetary: boolean;
  validationError?: string;
}

export interface RiskFactor {
  category: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ExtractionResult {
  documentId: string;
  status: 'complete' | 'partial' | 'failed';
  model: string;
  extractedAt: string;
  fields: ExtractedField[];
  riskFactors: RiskFactor[];
  confidence: {
    overall: number;
    averageFieldConfidence: number;
    fieldsWithHighConfidence: number;
    totalFields: number;
  };
  rawJson: Record<string, unknown>;
  processingTimeMs: number;
}

export interface ExtractionRequest {
  documentId: string;
  forceRefresh?: boolean;
  model?: string;
}

export interface ExtractionResponse {
  extraction: ExtractionResult;
  document: {
    id: string;
    name: string;
    status: string;
  };
}

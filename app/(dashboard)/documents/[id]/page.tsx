'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDocument } from '@/lib/hooks/useDocuments';
import { useExtraction, useExtractDocument } from '@/lib/hooks/useExtraction';
import { useAuthStore } from '@/lib/stores/authStore';
import { permissions } from '@/lib/utils/permissions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DocumentStatusBadge } from '@/components/documents/DocumentStatusBadge';
import { Loader2, ArrowLeft, RefreshCw, Download, FileText, AlertTriangle } from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { role } = useAuthStore();
  const canReExtract = role ? permissions.canReExtract(role) : false;
  const canExportJSON = role ? permissions.canExportJSON(role) : false;

  const { data: document, isLoading: isLoadingDoc } = useDocument(id);
  const { data: extraction, isLoading: isLoadingExtraction } = useExtraction(id);
  const extractDocument = useExtractDocument();

  const isLoading = isLoadingDoc || isLoadingExtraction;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Document not found</p>
        <Link href="/documents">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  const extractionResult = extraction?.extraction;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title={document.name} />
      </div>

      <div className="grid grid-cols-[400px_1fr] gap-6">
        {/* Left Panel - Metadata */}
        <div className="space-y-4">
          <Card className="p-4 bg-surface border-border">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-medium text-text-primary">{document.name}</h3>
                <DocumentStatusBadge status={document.status} />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Type</span>
                <span className="text-text-primary uppercase">{document.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Pages</span>
                <span className="text-text-primary font-mono">{document.pages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Size</span>
                <span className="text-text-primary font-mono">{formatBytes(document.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Uploaded</span>
                <span className="text-text-primary">{formatDate(document.uploadedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">By</span>
                <span className="text-text-primary">{document.uploadedBy.name}</span>
              </div>
            </div>

            {document.hasPII && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warning">
                  This document contains potentially sensitive information (PII).
                </p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {canReExtract && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => extractDocument.mutate({ documentId: id })}
                  disabled={extractDocument.isPending}
                >
                  <RefreshCw className={cn('h-4 w-4 mr-1', extractDocument.isPending && 'animate-spin')} />
                  Re-extract
                </Button>
              )}
              {canExportJSON && extractionResult && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export JSON
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right Panel - Extraction Results */}
        <div>
          {extractionResult ? (
            <Card className="p-6 bg-surface border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-text-primary">Extraction Results</h3>
                  <p className="text-sm text-text-secondary">
                    Model: {extractionResult.model} • {formatDate(extractionResult.extractedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Confidence</p>
                  <p className="text-2xl font-mono font-semibold text-accent">
                    {extractionResult.confidence.overall.toFixed(1)}%
                  </p>
                </div>
              </div>

              {extractionResult.status === 'partial' && (
                <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                  <p className="text-sm text-warning">
                    Partial extraction — some fields could not be validated.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium text-text-primary">Extracted Fields</h4>
                {extractionResult.fields.map((field: { label: string; value: string | number | null; confidence: number; confidenceLevel: string; isMonetary: boolean }, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-text-secondary">{field.label}</span>
                    <div className="flex items-center gap-3">
                      <span className={cn('font-mono', field.isMonetary && 'text-right')}>
                        {field.value ?? '—'}
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded uppercase',
                        field.confidenceLevel === 'high' && 'bg-success/20 text-success',
                        field.confidenceLevel === 'medium' && 'bg-warning/20 text-warning',
                        field.confidenceLevel === 'low' && 'bg-error/20 text-error'
                      )}>
                        {(field.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-8 bg-surface border-border text-center">
              <p className="text-text-secondary">No extraction data available</p>
              {canReExtract && document.status !== 'processing' && (
                <Button
                  onClick={() => extractDocument.mutate({ documentId: id })}
                  disabled={extractDocument.isPending}
                  className="mt-4 bg-accent hover:bg-accent-hover text-background"
                >
                  {extractDocument.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Extract Now
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useDocuments, useDeleteDocument } from '@/lib/hooks/useDocuments';
import { permissions } from '@/lib/utils/permissions';
import { PageHeader } from '@/components/layout/PageHeader';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { DocumentUploadZone } from '@/components/documents/DocumentUploadZone';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Loader2, Upload, FileText } from 'lucide-react';

export default function DocumentsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const { role } = useAuthStore();
  const canUpload = role ? permissions.canUpload(role) : false;
  const canDelete = role ? permissions.canDelete(role) : false;

  const { data, isLoading, error } = useDocuments();
  const deleteDocument = useDeleteDocument();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Failed to load documents"
        description="There was an error loading your documents. Please try again."
        action={
          <Button onClick={() => window.location.reload()}>Retry</Button>
        }
      />
    );
  }

  const documents = data?.documents || [];

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Manage and view your financial documents"
      >
        {canUpload && (
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-accent hover:bg-accent-hover text-background"
          >
            <Upload className="mr-2 h-4 w-4" />
            {showUpload ? 'Cancel' : 'Upload'}
          </Button>
        )}
      </PageHeader>

      {showUpload && canUpload && (
        <DocumentUploadZone onClose={() => setShowUpload(false)} />
      )}

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first financial document to get started with extraction and analysis."
          action={
            canUpload && (
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-accent hover:bg-accent-hover text-background"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            )
          }
        />
      ) : (
        <DocumentTable
          data={documents}
          onDelete={canDelete ? (id) => deleteDocument.mutate(id) : undefined}
          canDelete={canDelete}
        />
      )}
    </div>
  );
}

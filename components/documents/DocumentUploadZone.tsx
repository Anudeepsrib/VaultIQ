'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useUploadDocument } from '@/lib/hooks/useDocuments';
import { formatBytes } from '@/lib/utils/formatters';

interface DocumentUploadZoneProps {
  onClose: () => void;
}

export function DocumentUploadZone({ onClose }: DocumentUploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useUploadDocument();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      setError('Only PDF and DOCX files under 50MB are allowed');
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be under 50MB');
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    await upload.mutateAsync(file);
    setFile(null);
    onClose();
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-text-primary">Upload Document</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-accent bg-accent-muted'
              : 'border-border hover:border-accent/50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary mb-2">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-xs text-text-tertiary">PDF or DOCX, max 50MB</p>
        </div>
      ) : (
        <div className="bg-surface-raised rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-8 w-8 text-accent flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
              <p className="text-xs text-text-tertiary">{formatBytes(file.size)}</p>

              {upload.isPending ? (
                <div className="mt-3">
                  <Progress value={upload.isPending ? 50 : 100} className="h-1" />
                  <p className="text-xs text-text-secondary mt-1">Uploading...</p>
                </div>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              disabled={upload.isPending}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-4 p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={clearFile} disabled={upload.isPending}>
            Clear
          </Button>
          <Button
            onClick={handleUpload}
            disabled={upload.isPending}
            className="bg-accent hover:bg-accent-hover text-background"
          >
            {upload.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Document } from '@/lib/types/document';
import { formatDate, formatBytes } from '@/lib/utils/formatters';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, Trash2, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DocumentTableProps {
  data: Document[];
  onDelete?: (id: string) => void;
  canDelete: boolean;
}

const columnHelper = createColumnHelper<Document>();

export function DocumentTable({ data, onDelete, canDelete }: DocumentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-text-tertiary" />
          <span className="font-medium text-text-primary">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => (
        <span className="text-xs uppercase tracking-wider px-2 py-1 rounded bg-surface-raised text-text-secondary">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('pages', {
      header: 'Pages',
      cell: (info) => (
        <span className="font-mono text-text-secondary">{info.getValue() || '—'}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <DocumentStatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('uploadedBy', {
      header: 'Uploaded By',
      cell: (info) => <span className="text-text-secondary">{info.getValue().name}</span>,
    }),
    columnHelper.accessor('uploadedAt', {
      header: 'Upload Date',
      cell: (info) => (
        <span className="text-text-secondary">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const doc = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/documents/${doc.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-error hover:text-error"
                onClick={() => onDelete?.(doc.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search documents..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border border-border bg-surface">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-surface-raised/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-accent">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors',
                  index % 2 === 1 && 'bg-surface-raised/30'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

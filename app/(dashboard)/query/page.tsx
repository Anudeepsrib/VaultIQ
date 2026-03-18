'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { QueryInput } from '@/components/query/QueryInput';
import { QueryHistoryPanel } from '@/components/query/QueryHistoryPanel';

export default function QueryPage() {
  return (
    <div className="h-[calc(100vh-7rem)]">
      <PageHeader
        title="Query"
        description="Ask questions about your documents using natural language"
      />

      <div className="grid grid-cols-[1fr_300px] gap-6 h-[calc(100%-4rem)]">
        <div className="space-y-6">
          <QueryInput />
        </div>
        <QueryHistoryPanel />
      </div>
    </div>
  );
}

'use client';

import { useQueryStore } from '@/lib/stores/queryStore';
import { cn } from '@/lib/utils/cn';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { History, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function QueryHistoryPanel() {
  const { history, removeFromHistory, replayQuery, clearHistory } = useQueryStore();

  if (history.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4 h-full">
        <div className="flex items-center gap-2 mb-4 text-text-secondary">
          <History className="h-4 w-4" />
          <h3 className="text-sm font-medium">Recent Queries</h3>
        </div>
        <p className="text-sm text-text-tertiary text-center py-8">
          No queries yet. Start asking questions about your documents.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-text-secondary">
          <History className="h-4 w-4" />
          <h3 className="text-sm font-medium">Recent Queries</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-text-tertiary">
          Clear
        </Button>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => replayQuery(item.id)}
            className={cn(
              'group p-3 rounded-md cursor-pointer transition-colors',
              'hover:bg-surface-raised border border-transparent hover:border-border'
            )}
          >
            <p className="text-sm text-text-primary line-clamp-2 mb-1">{item.query}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">{formatRelativeTime(item.timestamp)}</span>
              <span className="text-xs text-accent uppercase">{item.model}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                removeFromHistory(item.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

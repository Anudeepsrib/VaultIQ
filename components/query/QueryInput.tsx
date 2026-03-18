'use client';

import { useState } from 'react';
import { useRagQuery } from '@/lib/hooks/useRag';
import { useQueryStore } from '@/lib/stores/queryStore';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Send, Loader2 } from 'lucide-react';

export function QueryInput() {
  const [query, setQuery] = useState('');
  const [model, setModel] = useState('phi4');
  const ragQuery = useRagQuery();

  const handleSubmit = async () => {
    if (!query.trim()) return;
    await ragQuery.mutateAsync({ query, model });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-[180px] bg-surface border-border">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            <SelectItem value="phi4">Phi-4</SelectItem>
            <SelectItem value="llama3.2">Llama 3.2</SelectItem>
            <SelectItem value="mistral">Mistral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about your documents..."
          className="min-h-[120px] bg-surface border-border resize-none pr-20"
          maxLength={1000}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          <span className="text-xs text-text-tertiary">{query.length}/1000</span>
          <Button
            onClick={handleSubmit}
            disabled={!query.trim() || ragQuery.isPending}
            size="sm"
            className="bg-accent hover:bg-accent-hover text-background"
          >
            {ragQuery.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Query
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

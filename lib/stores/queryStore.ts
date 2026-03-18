import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  model: string;
  answerPreview: string;
}

interface QueryState {
  history: QueryHistoryItem[];
  currentQuery: string;
  selectedModel: string;

  // Actions
  addToHistory: (item: Omit<QueryHistoryItem, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  setCurrentQuery: (query: string) => void;
  setSelectedModel: (model: string) => void;
  replayQuery: (id: string) => string | null;
}

export const useQueryStore = create<QueryState>()(
  persist(
    (set, get) => ({
      history: [],
      currentQuery: '',
      selectedModel: 'phi4',

      addToHistory: (item) => {
        const newItem: QueryHistoryItem = {
          ...item,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          history: [newItem, ...state.history].slice(0, 10), // Keep last 10
        }));
      },

      removeFromHistory: (id: string) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      setCurrentQuery: (query: string) => {
        set({ currentQuery: query });
      },

      setSelectedModel: (model: string) => {
        set({ selectedModel: model });
      },

      replayQuery: (id: string) => {
        const item = get().history.find((h) => h.id === id);
        if (item) {
          set({ currentQuery: item.query, selectedModel: item.model });
          return item.query;
        }
        return null;
      },
    }),
    {
      name: 'query-storage',
    }
  )
);

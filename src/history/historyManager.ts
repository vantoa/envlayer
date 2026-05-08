import { EnvMap } from '../merge/types';

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  layer: string;
  previous: EnvMap;
  current: EnvMap;
  description?: string;
}

const historyStore: HistoryEntry[] = [];

function generateId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function recordHistory(
  layer: string,
  previous: EnvMap,
  current: EnvMap,
  description?: string
): HistoryEntry {
  const entry: HistoryEntry = {
    id: generateId(),
    timestamp: new Date(),
    layer,
    previous: { ...previous },
    current: { ...current },
    description,
  };
  historyStore.push(entry);
  return entry;
}

export function getHistory(layer?: string): HistoryEntry[] {
  if (layer) {
    return historyStore.filter((e) => e.layer === layer);
  }
  return [...historyStore];
}

export function findHistoryEntry(id: string): HistoryEntry | undefined {
  return historyStore.find((e) => e.id === id);
}

export function undoHistory(id: string): EnvMap | undefined {
  const entry = findHistoryEntry(id);
  if (!entry) return undefined;
  return { ...entry.previous };
}

export function clearHistory(layer?: string): void {
  if (layer) {
    const indices: number[] = [];
    historyStore.forEach((e, i) => {
      if (e.layer === layer) indices.push(i);
    });
    for (let i = indices.length - 1; i >= 0; i--) {
      historyStore.splice(indices[i], 1);
    }
  } else {
    historyStore.length = 0;
  }
}

export function latestHistory(layer: string): HistoryEntry | undefined {
  const entries = getHistory(layer);
  return entries.length > 0 ? entries[entries.length - 1] : undefined;
}

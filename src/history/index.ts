import {
  recordHistory,
  getHistory,
  findHistoryEntry,
  undoHistory,
  clearHistory,
  latestHistory,
  HistoryEntry,
} from './historyManager';
import { EnvMap } from '../merge/types';

export function trackChange(
  layer: string,
  previous: EnvMap,
  current: EnvMap,
  description?: string
): HistoryEntry {
  return recordHistory(layer, previous, current, description);
}

export function getLayerHistory(layer: string): HistoryEntry[] {
  return getHistory(layer);
}

export function getAllHistory(): HistoryEntry[] {
  return getHistory();
}

export function revertToEntry(id: string): EnvMap | undefined {
  return undoHistory(id);
}

export function getLatestChange(layer: string): HistoryEntry | undefined {
  return latestHistory(layer);
}

export function getEntryById(id: string): HistoryEntry | undefined {
  return findHistoryEntry(id);
}

export function clearLayerHistory(layer: string): void {
  clearHistory(layer);
}

export function clearAllHistory(): void {
  clearHistory();
}

export type { HistoryEntry };

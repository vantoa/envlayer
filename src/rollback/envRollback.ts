import { RollbackEntry, RollbackResult, RollbackStore } from "./types";

let store: RollbackStore = { entries: [] };

function generateId(): string {
  return `rb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function recordRollbackPoint(
  layerId: string,
  previousMap: Record<string, string>,
  currentMap: Record<string, string>,
  description?: string
): RollbackEntry {
  const entry: RollbackEntry = {
    id: generateId(),
    layerId,
    timestamp: Date.now(),
    previousMap: { ...previousMap },
    currentMap: { ...currentMap },
    description,
  };
  store.entries.push(entry);
  return entry;
}

export function performRollback(
  entryId: string
): RollbackResult | null {
  const entry = store.entries.find((e) => e.id === entryId);
  if (!entry) return null;

  const prev = entry.previousMap;
  const curr = entry.currentMap;

  const restoredKeys = Object.keys(prev).filter(
    (k) => curr[k] !== undefined && curr[k] !== prev[k]
  );
  const removedKeys = Object.keys(curr).filter((k) => !(k in prev));
  const addedKeys = Object.keys(prev).filter((k) => !(k in curr));

  return {
    success: true,
    layerId: entry.layerId,
    restoredKeys,
    removedKeys,
    addedKeys,
    entryId,
  };
}

export function getRollbackHistory(layerId?: string): RollbackEntry[] {
  if (!layerId) return [...store.entries];
  return store.entries.filter((e) => e.layerId === layerId);
}

export function findRollbackEntry(entryId: string): RollbackEntry | undefined {
  return store.entries.find((e) => e.id === entryId);
}

export function clearRollbackHistory(layerId?: string): void {
  if (!layerId) {
    store = { entries: [] };
  } else {
    store.entries = store.entries.filter((e) => e.layerId !== layerId);
  }
}

export function getLatestRollbackPoint(layerId: string): RollbackEntry | undefined {
  const entries = store.entries.filter((e) => e.layerId === layerId);
  return entries[entries.length - 1];
}

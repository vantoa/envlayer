import { EnvMap } from '../merge/types';

export interface FreezeEntry {
  id: string;
  layer: string;
  keys: string[];
  frozenAt: number;
  reason?: string;
}

export interface FreezeResult {
  layer: string;
  frozen: string[];
  skipped: string[];
}

const freezeStore: Map<string, FreezeEntry> = new Map();

export function generateFreezeId(): string {
  return `freeze_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function freezeKeys(
  layer: string,
  envMap: EnvMap,
  keys: string[],
  reason?: string
): FreezeResult {
  const frozen: string[] = [];
  const skipped: string[] = [];

  for (const key of keys) {
    if (!(key in envMap)) {
      skipped.push(key);
      continue;
    }
    const existing = getFreezeEntry(layer);
    if (existing && existing.keys.includes(key)) {
      skipped.push(key);
      continue;
    }
    if (existing) {
      existing.keys.push(key);
    } else {
      const entry: FreezeEntry = {
        id: generateFreezeId(),
        layer,
        keys: [key],
        frozenAt: Date.now(),
        reason,
      };
      freezeStore.set(layer, entry);
    }
    frozen.push(key);
  }

  return { layer, frozen, skipped };
}

export function unfreezeKeys(layer: string, keys: string[]): string[] {
  const entry = freezeStore.get(layer);
  if (!entry) return [];
  const removed = keys.filter((k) => entry.keys.includes(k));
  entry.keys = entry.keys.filter((k) => !keys.includes(k));
  if (entry.keys.length === 0) freezeStore.delete(layer);
  return removed;
}

export function getFreezeEntry(layer: string): FreezeEntry | undefined {
  return freezeStore.get(layer);
}

export function isFrozen(layer: string, key: string): boolean {
  const entry = freezeStore.get(layer);
  return !!entry && entry.keys.includes(key);
}

export function applyFreeze(layer: string, incoming: EnvMap, base: EnvMap): EnvMap {
  const entry = freezeStore.get(layer);
  if (!entry) return incoming;
  const result: EnvMap = { ...incoming };
  for (const key of entry.keys) {
    if (key in base) {
      result[key] = base[key];
    }
  }
  return result;
}

export function clearFreezeStore(): void {
  freezeStore.clear();
}

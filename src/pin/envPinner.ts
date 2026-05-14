import { EnvMap } from '../merge/types';

export interface PinnedEntry {
  id: string;
  layer: string;
  key: string;
  value: string;
  pinnedAt: Date;
  reason?: string;
}

const pinnedStore: Map<string, PinnedEntry> = new Map();

function generatePinId(layer: string, key: string): string {
  return `${layer}::${key}`;
}

export function pinKey(
  layer: string,
  key: string,
  value: string,
  reason?: string
): PinnedEntry {
  const id = generatePinId(layer, key);
  const entry: PinnedEntry = { id, layer, key, value, pinnedAt: new Date(), reason };
  pinnedStore.set(id, entry);
  return entry;
}

export function unpinKey(layer: string, key: string): boolean {
  const id = generatePinId(layer, key);
  return pinnedStore.delete(id);
}

export function getPinnedKeys(layer: string): PinnedEntry[] {
  return Array.from(pinnedStore.values()).filter((e) => e.layer === layer);
}

export function isPinned(layer: string, key: string): boolean {
  return pinnedStore.has(generatePinId(layer, key));
}

export function applyPins(layer: string, envMap: EnvMap): EnvMap {
  const result: EnvMap = { ...envMap };
  for (const entry of getPinnedKeys(layer)) {
    result[entry.key] = entry.value;
  }
  return result;
}

export function clearPins(layer: string): number {
  const keys = Array.from(pinnedStore.keys()).filter((k) => k.startsWith(`${layer}::`));
  keys.forEach((k) => pinnedStore.delete(k));
  return keys.length;
}

export function getAllPins(): PinnedEntry[] {
  return Array.from(pinnedStore.values());
}

export function resetPinStore(): void {
  pinnedStore.clear();
}

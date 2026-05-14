import {
  pinKey,
  unpinKey,
  getPinnedKeys,
  isPinned,
  applyPins,
  clearPins,
  getAllPins,
  resetPinStore,
  PinnedEntry,
} from './envPinner';
import { EnvMap } from '../merge/types';

export function pinEnvKey(
  layer: string,
  key: string,
  value: string,
  reason?: string
): PinnedEntry {
  return pinKey(layer, key, value, reason);
}

export function unpinEnvKey(layer: string, key: string): boolean {
  return unpinKey(layer, key);
}

export function getLayerPins(layer: string): PinnedEntry[] {
  return getPinnedKeys(layer);
}

export function isKeyPinned(layer: string, key: string): boolean {
  return isPinned(layer, key);
}

export function applyLayerPins(layer: string, envMap: EnvMap): EnvMap {
  return applyPins(layer, envMap);
}

export function clearLayerPins(layer: string): number {
  return clearPins(layer);
}

export function listAllPins(): PinnedEntry[] {
  return getAllPins();
}

export function resetPins(): void {
  resetPinStore();
}

export type { PinnedEntry };

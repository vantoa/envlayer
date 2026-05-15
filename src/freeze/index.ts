import { EnvMap } from '../merge/types';
import {
  freezeKeys,
  unfreezeKeys,
  getFreezeEntry,
  isFrozen,
  applyFreeze,
  clearFreezeStore,
  FreezeResult,
} from './envFreezer';

export function freezeEnvKeys(
  layer: string,
  envMap: EnvMap,
  keys: string[],
  reason?: string
): FreezeResult {
  return freezeKeys(layer, envMap, keys, reason);
}

export function unfreezeEnvKeys(layer: string, keys: string[]): string[] {
  return unfreezeKeys(layer, keys);
}

export function getFrozenKeys(layer: string): string[] {
  const entry = getFreezeEntry(layer);
  return entry ? [...entry.keys] : [];
}

export function isKeyFrozen(layer: string, key: string): boolean {
  return isFrozen(layer, key);
}

export function applyFrozenValues(
  layer: string,
  incoming: EnvMap,
  base: EnvMap
): EnvMap {
  return applyFreeze(layer, incoming, base);
}

export function hasFrozenKeys(layer: string): boolean {
  return getFrozenKeys(layer).length > 0;
}

export function resetFreezeStore(): void {
  clearFreezeStore();
}

export { FreezeResult };

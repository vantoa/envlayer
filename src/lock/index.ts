import {
  acquireLock,
  releaseLock,
  getLock,
  isLocked,
  clearAllLocks,
  listLocks,
} from './envLocker';
import { LockOptions, LockResult, EnvLock } from './types';

export function lockLayer(
  layer: string,
  options?: LockOptions
): LockResult {
  return acquireLock(layer, options);
}

export function unlockLayer(layer: string, owner?: string): boolean {
  return releaseLock(layer, owner);
}

export function getLayerLock(layer: string): EnvLock | undefined {
  return getLock(layer);
}

export function isLayerLocked(layer: string): boolean {
  return isLocked(layer);
}

export function resetAllLocks(): void {
  clearAllLocks();
}

export function getActiveLocks(): EnvLock[] {
  return listLocks();
}

export function withLock<T>(
  layer: string,
  fn: () => T,
  options?: LockOptions
): T {
  const result = lockLayer(layer, options);
  if (!result.success) {
    throw new Error(result.error ?? `Failed to acquire lock on layer "${layer}"`);
  }
  try {
    return fn();
  } finally {
    unlockLayer(layer, options?.owner);
  }
}

export type { EnvLock, LockMode, LockOptions, LockResult } from './types';

import { EnvLock, LockMode, LockOptions, LockResult, LockStore } from './types';

const lockStore: LockStore = {};

export function generateLockId(): string {
  return `lock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function acquireLock(
  layer: string,
  options: LockOptions = {}
): LockResult {
  const existing = lockStore[layer];

  if (existing) {
    if (existing.expiresAt && existing.expiresAt < new Date()) {
      delete lockStore[layer];
    } else {
      return {
        success: false,
        error: `Layer "${layer}" is already locked by "${existing.owner}" in ${existing.mode} mode`,
      };
    }
  }

  const now = new Date();
  const lock: EnvLock = {
    id: generateLockId(),
    layer,
    mode: options.mode ?? 'write',
    owner: options.owner ?? 'anonymous',
    acquiredAt: now,
    expiresAt: options.ttlMs ? new Date(now.getTime() + options.ttlMs) : undefined,
    metadata: options.metadata,
  };

  lockStore[layer] = lock;
  return { success: true, lock };
}

export function releaseLock(layer: string, owner?: string): boolean {
  const lock = lockStore[layer];
  if (!lock) return false;
  if (owner && lock.owner !== owner) return false;
  delete lockStore[layer];
  return true;
}

export function getLock(layer: string): EnvLock | undefined {
  const lock = lockStore[layer];
  if (!lock) return undefined;
  if (lock.expiresAt && lock.expiresAt < new Date()) {
    delete lockStore[layer];
    return undefined;
  }
  return lock;
}

export function isLocked(layer: string): boolean {
  return getLock(layer) !== undefined;
}

export function clearAllLocks(): void {
  Object.keys(lockStore).forEach((key) => delete lockStore[key]);
}

export function listLocks(): EnvLock[] {
  const now = new Date();
  return Object.values(lockStore).filter(
    (lock) => !lock.expiresAt || lock.expiresAt >= now
  );
}

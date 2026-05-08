/**
 * envLocker.ts
 * Provides locking mechanism to prevent concurrent modifications to env layers.
 */

export interface LockEntry {
  layer: string;
  lockedAt: number;
  lockedBy: string;
  ttl: number; // time-to-live in milliseconds
}

const lockStore = new Map<string, LockEntry>();

export function acquireLock(
  layer: string,
  lockedBy: string,
  ttl = 30_000
): LockEntry | null {
  const existing = lockStore.get(layer);

  if (existing) {
    const expired = Date.now() > existing.lockedAt + existing.ttl;
    if (!expired) {
      return null; // lock is held by someone else
    }
  }

  const entry: LockEntry = {
    layer,
    lockedBy,
    lockedAt: Date.now(),
    ttl,
  };

  lockStore.set(layer, entry);
  return entry;
}

export function releaseLock(layer: string, lockedBy: string): boolean {
  const existing = lockStore.get(layer);
  if (!existing || existing.lockedBy !== lockedBy) {
    return false;
  }
  lockStore.delete(layer);
  return true;
}

export function getLock(layer: string): LockEntry | undefined {
  const entry = lockStore.get(layer);
  if (!entry) return undefined;

  const expired = Date.now() > entry.lockedAt + entry.ttl;
  if (expired) {
    lockStore.delete(layer);
    return undefined;
  }

  return entry;
}

export function isLocked(layer: string): boolean {
  return getLock(layer) !== undefined;
}

export function clearAllLocks(): void {
  lockStore.clear();
}

export function listLocks(): LockEntry[] {
  const now = Date.now();
  const active: LockEntry[] = [];

  for (const [layer, entry] of lockStore.entries()) {
    if (now <= entry.lockedAt + entry.ttl) {
      active.push(entry);
    } else {
      lockStore.delete(layer);
    }
  }

  return active;
}

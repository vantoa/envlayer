import { EnvLock } from './types';

function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

export function formatLockEntry(lock: EnvLock): string {
  const expiry = lock.expiresAt
    ? ` (expires ${formatDate(lock.expiresAt)})`
    : ' (no expiry)';
  return `[${lock.mode.toUpperCase()}] ${lock.layer} — owner: ${lock.owner}, acquired: ${formatDate(lock.acquiredAt)}${expiry}`;
}

export function formatLockList(locks: EnvLock[]): string {
  if (locks.length === 0) {
    return 'No active locks.';
  }
  const header = `Active locks (${locks.length}):`;
  const rows = locks.map((l) => `  • ${formatLockEntry(l)}`);
  return [header, ...rows].join('\n');
}

export function formatLockResult(
  layer: string,
  success: boolean,
  error?: string
): string {
  if (success) {
    return `✔ Lock acquired on layer "${layer}".`;
  }
  return `✘ Failed to lock layer "${layer}": ${error ?? 'unknown error'}`;
}

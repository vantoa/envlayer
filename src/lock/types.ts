export type LockMode = 'read' | 'write' | 'exclusive';

export interface EnvLock {
  id: string;
  layer: string;
  mode: LockMode;
  owner: string;
  acquiredAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, string>;
}

export interface LockResult {
  success: boolean;
  lock?: EnvLock;
  error?: string;
}

export interface LockOptions {
  mode?: LockMode;
  owner?: string;
  ttlMs?: number;
  metadata?: Record<string, string>;
}

export interface LockStore {
  [layer: string]: EnvLock;
}

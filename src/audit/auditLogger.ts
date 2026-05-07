import { EnvMap } from '../merge/types';

export type AuditAction =
  | 'load'
  | 'merge'
  | 'export'
  | 'snapshot'
  | 'diff'
  | 'validate';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  layer?: string;
  keys: string[];
  meta?: Record<string, unknown>;
}

let _log: AuditEntry[] = [];

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function recordAudit(
  action: AuditAction,
  envMap: EnvMap,
  layer?: string,
  meta?: Record<string, unknown>
): AuditEntry {
  const entry: AuditEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action,
    layer,
    keys: Object.keys(envMap),
    meta,
  };
  _log.push(entry);
  return entry;
}

export function getAuditLog(): ReadonlyArray<AuditEntry> {
  return _log;
}

export function clearAuditLog(): void {
  _log = [];
}

export function filterAuditLog(
  predicate: (entry: AuditEntry) => boolean
): AuditEntry[] {
  return _log.filter(predicate);
}

export function formatAuditEntry(entry: AuditEntry): string {
  const keyCount = entry.keys.length;
  const layerPart = entry.layer ? ` [${entry.layer}]` : '';
  return `[${entry.timestamp}] ${entry.action.toUpperCase()}${layerPart} — ${keyCount} key(s): ${entry.keys.join(', ')}`;
}

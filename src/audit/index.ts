import { EnvMap } from '../merge/types';
import {
  AuditAction,
  AuditEntry,
  recordAudit,
  getAuditLog,
  clearAuditLog,
  filterAuditLog,
  formatAuditEntry,
} from './auditLogger';

export type { AuditAction, AuditEntry };

export function logAction(
  action: AuditAction,
  envMap: EnvMap,
  layer?: string,
  meta?: Record<string, unknown>
): AuditEntry {
  return recordAudit(action, envMap, layer, meta);
}

export function getLog(): ReadonlyArray<AuditEntry> {
  return getAuditLog();
}

export function clearLog(): void {
  clearAuditLog();
}

export function getLogForLayer(layer: string): AuditEntry[] {
  return filterAuditLog((e) => e.layer === layer);
}

export function getLogForAction(action: AuditAction): AuditEntry[] {
  return filterAuditLog((e) => e.action === action);
}

export function printAuditLog(): void {
  const log = getAuditLog();
  if (log.length === 0) {
    console.log('No audit entries recorded.');
    return;
  }
  log.forEach((entry) => console.log(formatAuditEntry(entry)));
}

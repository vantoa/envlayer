import {
  recordRollbackPoint,
  performRollback,
  getRollbackHistory,
  findRollbackEntry,
  clearRollbackHistory,
  getLatestRollbackPoint,
} from "./envRollback";
import { RollbackEntry, RollbackResult } from "./types";

export function checkpoint(
  layerId: string,
  previousMap: Record<string, string>,
  currentMap: Record<string, string>,
  description?: string
): RollbackEntry {
  return recordRollbackPoint(layerId, previousMap, currentMap, description);
}

export function rollbackTo(
  entryId: string
): RollbackResult | null {
  return performRollback(entryId);
}

export function rollbackLatest(
  layerId: string
): RollbackResult | null {
  const entry = getLatestRollbackPoint(layerId);
  if (!entry) return null;
  return performRollback(entry.id);
}

export function getRollbackLog(layerId?: string): RollbackEntry[] {
  return getRollbackHistory(layerId);
}

export function getCheckpoint(entryId: string): RollbackEntry | undefined {
  return findRollbackEntry(entryId);
}

export function clearRollbacks(layerId?: string): void {
  clearRollbackHistory(layerId);
}

export function hasRollbackPoints(layerId: string): boolean {
  return getRollbackHistory(layerId).length > 0;
}

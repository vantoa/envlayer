export type RollbackTarget = "layer" | "global";

/**
 * Represents a single rollback entry capturing the state transition
 * of a layer's environment variable map at a point in time.
 */
export interface RollbackEntry {
  id: string;
  layerId: string;
  timestamp: number;
  previousMap: Record<string, string>;
  currentMap: Record<string, string>;
  description?: string;
}

/**
 * The result of applying a rollback operation, detailing which keys
 * were restored, removed, or added as part of the rollback.
 */
export interface RollbackResult {
  success: boolean;
  layerId: string;
  restoredKeys: string[];
  removedKeys: string[];
  addedKeys: string[];
  entryId: string;
}

/**
 * In-memory store holding all rollback entries, optionally bounded
 * by a maximum number of entries to prevent unbounded growth.
 */
export interface RollbackStore {
  entries: RollbackEntry[];
  maxEntries?: number;
}

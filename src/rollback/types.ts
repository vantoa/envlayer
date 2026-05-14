export type RollbackTarget = "layer" | "global";

export interface RollbackEntry {
  id: string;
  layerId: string;
  timestamp: number;
  previousMap: Record<string, string>;
  currentMap: Record<string, string>;
  description?: string;
}

export interface RollbackResult {
  success: boolean;
  layerId: string;
  restoredKeys: string[];
  removedKeys: string[];
  addedKeys: string[];
  entryId: string;
}

export interface RollbackStore {
  entries: RollbackEntry[];
}

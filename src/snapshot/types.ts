export interface EnvSnapshot {
  id: string;
  label: string;
  timestamp: number;
  layer: string;
  entries: Record<string, string>;
}

export interface SnapshotDiff {
  from: EnvSnapshot;
  to: EnvSnapshot;
  added: string[];
  removed: string[];
  changed: string[];
}

export interface SnapshotStore {
  snapshots: EnvSnapshot[];
}

export type SnapshotComparison = {
  snapshotId: string;
  label: string;
  timestamp: number;
  layer: string;
  keyCount: number;
};

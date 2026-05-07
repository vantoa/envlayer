import { EnvSnapshot, SnapshotDiff, SnapshotStore, SnapshotComparison } from "./types";
import {
  createSnapshot,
  diffSnapshots,
  listSnapshots,
  findSnapshot,
  addSnapshot,
  removeSnapshot,
} from "./snapshotManager";

export type { EnvSnapshot, SnapshotDiff, SnapshotStore, SnapshotComparison };

export function takeSnapshot(
  store: SnapshotStore,
  label: string,
  layer: string,
  entries: Record<string, string>
): { store: SnapshotStore; snapshot: EnvSnapshot } {
  const snapshot = createSnapshot(label, layer, entries);
  const updated = addSnapshot(store, snapshot);
  return { store: updated, snapshot };
}

export function compareSnapshots(
  store: SnapshotStore,
  fromId: string,
  toId: string
): SnapshotDiff | null {
  const from = findSnapshot(store, fromId);
  const to = findSnapshot(store, toId);
  if (!from || !to) return null;
  return diffSnapshots(from, to);
}

export { listSnapshots, findSnapshot, removeSnapshot };

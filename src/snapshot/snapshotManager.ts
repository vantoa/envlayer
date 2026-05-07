import { randomUUID } from "crypto";
import { EnvSnapshot, SnapshotDiff, SnapshotComparison, SnapshotStore } from "./types";

export function createSnapshot(
  label: string,
  layer: string,
  entries: Record<string, string>
): EnvSnapshot {
  return {
    id: randomUUID(),
    label,
    timestamp: Date.now(),
    layer,
    entries: { ...entries },
  };
}

export function diffSnapshots(from: EnvSnapshot, to: EnvSnapshot): SnapshotDiff {
  const fromKeys = new Set(Object.keys(from.entries));
  const toKeys = new Set(Object.keys(to.entries));

  const added = [...toKeys].filter((k) => !fromKeys.has(k));
  const removed = [...fromKeys].filter((k) => !toKeys.has(k));
  const changed = [...fromKeys].filter(
    (k) => toKeys.has(k) && from.entries[k] !== to.entries[k]
  );

  return { from, to, added, removed, changed };
}

export function listSnapshots(store: SnapshotStore): SnapshotComparison[] {
  return store.snapshots.map((s) => ({
    snapshotId: s.id,
    label: s.label,
    timestamp: s.timestamp,
    layer: s.layer,
    keyCount: Object.keys(s.entries).length,
  }));
}

export function findSnapshot(store: SnapshotStore, id: string): EnvSnapshot | undefined {
  return store.snapshots.find((s) => s.id === id);
}

export function addSnapshot(store: SnapshotStore, snapshot: EnvSnapshot): SnapshotStore {
  return { snapshots: [...store.snapshots, snapshot] };
}

export function removeSnapshot(store: SnapshotStore, id: string): SnapshotStore {
  return { snapshots: store.snapshots.filter((s) => s.id !== id) };
}

/**
 * Returns the most recent snapshot for a given layer, or undefined if none exist.
 */
export function latestSnapshotForLayer(
  store: SnapshotStore,
  layer: string
): EnvSnapshot | undefined {
  return store.snapshots
    .filter((s) => s.layer === layer)
    .sort((a, b) => b.timestamp - a.timestamp)[0];
}

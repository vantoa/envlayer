import {
  createSnapshot,
  diffSnapshots,
  listSnapshots,
  addSnapshot,
  removeSnapshot,
  findSnapshot,
} from "../snapshotManager";
import { SnapshotStore } from "../types";

const emptyStore: SnapshotStore = { snapshots: [] };

describe("createSnapshot", () => {
  it("creates a snapshot with correct fields", () => {
    const snap = createSnapshot("baseline", "production", { FOO: "bar" });
    expect(snap.label).toBe("baseline");
    expect(snap.layer).toBe("production");
    expect(snap.entries).toEqual({ FOO: "bar" });
    expect(typeof snap.id).toBe("string");
    expect(snap.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it("does not mutate original entries", () => {
    const entries = { A: "1" };
    const snap = createSnapshot("test", "dev", entries);
    entries.A = "changed";
    expect(snap.entries.A).toBe("1");
  });
});

describe("diffSnapshots", () => {
  const base = createSnapshot("v1", "dev", { A: "1", B: "2" });

  it("detects added keys", () => {
    const next = createSnapshot("v2", "dev", { A: "1", B: "2", C: "3" });
    const diff = diffSnapshots(base, next);
    expect(diff.added).toContain("C");
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
  });

  it("detects removed keys", () => {
    const next = createSnapshot("v2", "dev", { A: "1" });
    const diff = diffSnapshots(base, next);
    expect(diff.removed).toContain("B");
  });

  it("detects changed values", () => {
    const next = createSnapshot("v2", "dev", { A: "99", B: "2" });
    const diff = diffSnapshots(base, next);
    expect(diff.changed).toContain("A");
  });
});

describe("store operations", () => {
  it("adds and lists snapshots", () => {
    const snap = createSnapshot("s1", "staging", { X: "1" });
    const store = addSnapshot(emptyStore, snap);
    const list = listSnapshots(store);
    expect(list).toHaveLength(1);
    expect(list[0].label).toBe("s1");
    expect(list[0].keyCount).toBe(1);
  });

  it("removes a snapshot by id", () => {
    const snap = createSnapshot("s1", "staging", {});
    const store = addSnapshot(emptyStore, snap);
    const updated = removeSnapshot(store, snap.id);
    expect(updated.snapshots).toHaveLength(0);
  });

  it("finds a snapshot by id", () => {
    const snap = createSnapshot("s1", "staging", {});
    const store = addSnapshot(emptyStore, snap);
    expect(findSnapshot(store, snap.id)).toEqual(snap);
    expect(findSnapshot(store, "nonexistent")).toBeUndefined();
  });
});

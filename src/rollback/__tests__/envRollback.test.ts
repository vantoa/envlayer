import {
  checkpoint,
  rollbackTo,
  rollbackLatest,
  getRollbackLog,
  getCheckpoint,
  clearRollbacks,
  hasRollbackPoints,
} from "../index";

const prev = { API_URL: "http://old.example.com", DEBUG: "false" };
const curr = { API_URL: "http://new.example.com", DEBUG: "true", NEW_KEY: "value" };

beforeEach(() => {
  clearRollbacks();
});

describe("checkpoint", () => {
  it("records a rollback point and returns an entry", () => {
    const entry = checkpoint("dev", prev, curr, "before update");
    expect(entry.id).toMatch(/^rb_/);
    expect(entry.layerId).toBe("dev");
    expect(entry.description).toBe("before update");
  });

  it("stores multiple entries", () => {
    checkpoint("dev", prev, curr);
    checkpoint("dev", curr, prev);
    expect(getRollbackLog("dev")).toHaveLength(2);
  });
});

describe("rollbackTo", () => {
  it("returns null for unknown entry id", () => {
    expect(rollbackTo("nonexistent")).toBeNull();
  });

  it("returns a rollback result with correct key diffs", () => {
    const entry = checkpoint("dev", prev, curr);
    const result = rollbackTo(entry.id);
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
    expect(result!.layerId).toBe("dev");
    expect(result!.removedKeys).toContain("NEW_KEY");
    expect(result!.restoredKeys).toContain("API_URL");
  });
});

describe("rollbackLatest", () => {
  it("returns null when no checkpoints exist", () => {
    expect(rollbackLatest("dev")).toBeNull();
  });

  it("rolls back the most recent checkpoint", () => {
    checkpoint("dev", prev, curr);
    const result = rollbackLatest("dev");
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
  });
});

describe("getRollbackLog", () => {
  it("filters by layerId", () => {
    checkpoint("dev", prev, curr);
    checkpoint("prod", prev, curr);
    expect(getRollbackLog("dev")).toHaveLength(1);
    expect(getRollbackLog("prod")).toHaveLength(1);
    expect(getRollbackLog()).toHaveLength(2);
  });
});

describe("getCheckpoint", () => {
  it("retrieves entry by id", () => {
    const entry = checkpoint("dev", prev, curr);
    expect(getCheckpoint(entry.id)).toEqual(entry);
  });

  it("returns undefined for missing id", () => {
    expect(getCheckpoint("missing")).toBeUndefined();
  });
});

describe("hasRollbackPoints", () => {
  it("returns false when no checkpoints", () => {
    expect(hasRollbackPoints("dev")).toBe(false);
  });

  it("returns true after checkpoint is added", () => {
    checkpoint("dev", prev, curr);
    expect(hasRollbackPoints("dev")).toBe(true);
  });
});

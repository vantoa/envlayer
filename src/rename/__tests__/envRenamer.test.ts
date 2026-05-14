import { renameKey, bulkRename } from "../envRenamer";
import { renameEnvKey, renameEnvKeys, wouldConflict, printRenameResult } from "../index";

const baseMap = { FOO: "bar", BAZ: "qux", SECRET: "s3cr3t" };

describe("renameKey", () => {
  it("renames an existing key", () => {
    const { map, result } = renameKey({ ...baseMap }, "FOO", "FOO_NEW", "test");
    expect(map.FOO_NEW).toBe("bar");
    expect(map.FOO).toBeUndefined();
    expect(result.success).toBe(true);
    expect(result.conflict).toBe(false);
  });

  it("returns failure when key does not exist", () => {
    const { map, result } = renameKey({ ...baseMap }, "MISSING", "NEW", "test");
    expect(result.success).toBe(false);
    expect(result.conflict).toBe(false);
    expect(map).toEqual(baseMap);
  });

  it("detects conflict without overwrite", () => {
    const { map, result } = renameKey({ ...baseMap }, "FOO", "BAZ", "test", false);
    expect(result.success).toBe(false);
    expect(result.conflict).toBe(true);
    expect(map.FOO).toBe("bar"); // unchanged
  });

  it("overwrites conflicting key when overwrite=true", () => {
    const { map, result } = renameKey({ ...baseMap }, "FOO", "BAZ", "test", true);
    expect(result.success).toBe(true);
    expect(map.BAZ).toBe("bar");
    expect(map.FOO).toBeUndefined();
  });
});

describe("bulkRename", () => {
  it("renames multiple keys sequentially", () => {
    const { map, result } = bulkRename(
      { ...baseMap },
      [{ oldKey: "FOO", newKey: "FOO_RENAMED" }, { oldKey: "BAZ", newKey: "BAZ_RENAMED" }],
      "test"
    );
    expect(map.FOO_RENAMED).toBe("bar");
    expect(map.BAZ_RENAMED).toBe("qux");
    expect(result.renamed).toBe(2);
    expect(result.skipped).toBe(0);
  });

  it("counts skipped and conflicts correctly", () => {
    const { result } = bulkRename(
      { ...baseMap },
      [
        { oldKey: "MISSING", newKey: "X" },
        { oldKey: "FOO", newKey: "BAZ" }
      ],
      "test",
      false
    );
    expect(result.skipped).toBe(1);
    expect(result.conflicts).toBe(1);
    expect(result.renamed).toBe(0);
  });
});

describe("renameEnvKey (index)", () => {
  it("throws when throwOnMissing=true and key absent", () => {
    expect(() =>
      renameEnvKey({ ...baseMap }, "NOPE", "NEW", "layer", { throwOnMissing: true })
    ).toThrow();
  });

  it("does not throw when throwOnMissing=false", () => {
    const { result } = renameEnvKey({ ...baseMap }, "NOPE", "NEW", "layer", { throwOnMissing: false });
    expect(result.success).toBe(false);
  });
});

describe("wouldConflict", () => {
  it("returns true when key exists", () => {
    expect(wouldConflict(baseMap, "FOO")).toBe(true);
  });

  it("returns false when key absent", () => {
    expect(wouldConflict(baseMap, "GHOST")).toBe(false);
  });
});

describe("printRenameResult", () => {
  it("prints without throwing", () => {
    const { result } = renameEnvKeys({ ...baseMap }, [{ oldKey: "FOO", newKey: "FOO2" }], "test");
    expect(() => printRenameResult(result)).not.toThrow();
  });
});

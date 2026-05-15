import {
  resolveEnvChain,
  findMissingKeys,
  resolveWithRequired,
  formatResolveResult,
} from "../envResolver";

describe("resolveEnvChain", () => {
  it("returns base map when no overrides provided", () => {
    const base = { FOO: "foo", BAR: "bar" };
    const result = resolveEnvChain(base);
    expect(result.resolved).toEqual(base);
    expect(result.overrides).toEqual({});
  });

  it("applies overrides from later sources", () => {
    const base = { FOO: "base", BAR: "base" };
    const result = resolveEnvChain(
      base,
      { source: "layer1", map: { FOO: "layer1" } },
      { source: "layer2", map: { FOO: "layer2", BAR: "layer2" } }
    );
    expect(result.resolved.FOO).toBe("layer2");
    expect(result.resolved.BAR).toBe("layer2");
  });

  it("records override metadata correctly", () => {
    const base = { FOO: "original" };
    const result = resolveEnvChain(base, {
      source: "prod",
      map: { FOO: "overridden" },
    });
    expect(result.overrides["FOO"]).toEqual({
      from: "prod",
      original: "original",
      final: "overridden",
    });
  });

  it("adds new keys from overrides without logging them as overrides", () => {
    const base = {};
    const result = resolveEnvChain(base, { source: "extra", map: { NEW_KEY: "value" } });
    expect(result.resolved.NEW_KEY).toBe("value");
    expect(result.overrides["NEW_KEY"]).toBeUndefined();
  });
});

describe("findMissingKeys", () => {
  it("returns keys not present in resolved map", () => {
    const resolved = { FOO: "foo" };
    expect(findMissingKeys(resolved, ["FOO", "BAR"])).toEqual(["BAR"]);
  });

  it("treats empty string values as missing", () => {
    const resolved = { FOO: "" };
    expect(findMissingKeys(resolved, ["FOO"])).toEqual(["FOO"]);
  });

  it("returns empty array when all keys present", () => {
    const resolved = { FOO: "foo", BAR: "bar" };
    expect(findMissingKeys(resolved, ["FOO", "BAR"])).toEqual([]);
  });
});

describe("resolveWithRequired", () => {
  it("populates missing field in result", () => {
    const base = { FOO: "foo" };
    const result = resolveWithRequired(base, ["FOO", "MISSING"]);
    expect(result.missing).toEqual(["MISSING"]);
  });
});

describe("formatResolveResult", () => {
  it("formats override and missing summary", () => {
    const result = {
      resolved: { FOO: "new" },
      overrides: { FOO: { from: "prod", original: "old", final: "new" } },
      missing: ["BAR"],
    };
    const output = formatResolveResult(result);
    expect(output).toContain("FOO");
    expect(output).toContain("prod");
    expect(output).toContain("Missing required keys: BAR");
  });

  it("shows positive message when nothing is missing", () => {
    const result = { resolved: { FOO: "x" }, overrides: {}, missing: [] };
    const output = formatResolveResult(result);
    expect(output).toContain("All required keys present.");
    expect(output).toContain("No overrides applied.");
  });
});

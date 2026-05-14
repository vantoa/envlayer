import {
  sanitizeEnvMap,
  isValidKey,
  formatSanitizeResult,
} from "../envSanitizer";

describe("isValidKey", () => {
  it("accepts valid uppercase keys", () => {
    expect(isValidKey("MY_VAR")).toBe(true);
    expect(isValidKey("APP_PORT")).toBe(true);
    expect(isValidKey("DB_URL_1")).toBe(true);
  });

  it("accepts lowercase and mixed keys", () => {
    expect(isValidKey("myVar")).toBe(true);
    expect(isValidKey("_private")).toBe(true);
  });

  it("rejects keys starting with digits", () => {
    expect(isValidKey("1INVALID")).toBe(false);
  });

  it("rejects keys with spaces or special chars", () => {
    expect(isValidKey("MY VAR")).toBe(false);
    expect(isValidKey("MY-VAR")).toBe(false);
    expect(isValidKey("MY.VAR")).toBe(false);
  });
});

describe("sanitizeEnvMap", () => {
  it("trims whitespace from values by default", () => {
    const result = sanitizeEnvMap({ KEY: "  value  " });
    expect(result.sanitized["KEY"]).toBe("value");
    expect(result.modified).toContain("KEY");
  });

  it("removes invalid keys when removeInvalidKeys is true", () => {
    const result = sanitizeEnvMap({ "1BAD": "val", GOOD: "ok" });
    expect(result.sanitized).not.toHaveProperty("1BAD");
    expect(result.removed).toContain("1BAD");
    expect(result.sanitized["GOOD"]).toBe("ok");
  });

  it("strips empty values when stripEmptyValues is true", () => {
    const result = sanitizeEnvMap(
      { EMPTY: "", PRESENT: "hello" },
      { stripEmptyValues: true }
    );
    expect(result.sanitized).not.toHaveProperty("EMPTY");
    expect(result.removed).toContain("EMPTY");
    expect(result.sanitized["PRESENT"]).toBe("hello");
  });

  it("preserves empty values when stripEmptyValues is false", () => {
    const result = sanitizeEnvMap({ EMPTY: "" }, { stripEmptyValues: false });
    expect(result.sanitized).toHaveProperty("EMPTY", "");
    expect(result.removed).not.toContain("EMPTY");
  });

  it("does not trim when trimWhitespace is false", () => {
    const result = sanitizeEnvMap(
      { KEY: "  spaced  " },
      { trimWhitespace: false }
    );
    expect(result.sanitized["KEY"]).toBe("  spaced  ");
    expect(result.modified).not.toContain("KEY");
  });

  it("returns empty removed and modified arrays for clean input", () => {
    const result = sanitizeEnvMap({ HOST: "localhost", PORT: "3000" });
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });
});

describe("formatSanitizeResult", () => {
  it("shows no changes message when nothing changed", () => {
    const output = formatSanitizeResult({ sanitized: {}, removed: [], modified: [] });
    expect(output).toContain("No changes");
  });

  it("lists modified and removed keys", () => {
    const output = formatSanitizeResult({
      sanitized: {},
      removed: ["BAD_KEY"],
      modified: ["TRIMMED"],
    });
    expect(output).toContain("BAD_KEY");
    expect(output).toContain("TRIMMED");
  });
});

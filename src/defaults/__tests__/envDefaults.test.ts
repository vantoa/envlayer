import { describe, it, expect } from "vitest";
import {
  applyDefaults,
  getMissingDefaultKeys,
  formatDefaultsResult,
} from "../envDefaults";
import {
  withDefaults,
  withDefaultsFull,
  missingDefaults,
  hasAllDefaults,
} from "../index";

const baseEnv = { HOST: "localhost", PORT: "3000", DEBUG: "" };
const defaults = { PORT: "8080", DEBUG: "false", LOG_LEVEL: "info" };

describe("applyDefaults", () => {
  it("applies defaults only for missing keys", () => {
    const result = applyDefaults(baseEnv, defaults);
    expect(result.output.LOG_LEVEL).toBe("info");
    expect(result.output.PORT).toBe("3000"); // existing, not overwritten
    expect(result.applied).toEqual({ LOG_LEVEL: "info" });
  });

  it("skips existing keys and records them", () => {
    const result = applyDefaults(baseEnv, defaults);
    expect(result.skipped.PORT).toBe("3000");
    expect(result.skipped.DEBUG).toBe("");
  });

  it("overwrites empty strings when overwriteEmpty is true", () => {
    const result = applyDefaults(baseEnv, defaults, true);
    expect(result.output.DEBUG).toBe("false");
    expect(result.applied.DEBUG).toBe("false");
  });

  it("does not mutate the original env", () => {
    applyDefaults(baseEnv, defaults);
    expect(baseEnv.LOG_LEVEL).toBeUndefined();
  });
});

describe("getMissingDefaultKeys", () => {
  it("returns keys present in defaults but absent in env", () => {
    const missing = getMissingDefaultKeys(baseEnv, defaults);
    expect(missing).toContain("LOG_LEVEL");
    expect(missing).not.toContain("PORT");
  });

  it("returns empty array when env has all default keys", () => {
    const full = { PORT: "3000", DEBUG: "true", LOG_LEVEL: "warn" };
    expect(getMissingDefaultKeys(full, defaults)).toHaveLength(0);
  });
});

describe("formatDefaultsResult", () => {
  it("includes applied keys in output", () => {
    const result = applyDefaults(baseEnv, defaults);
    const text = formatDefaultsResult(result);
    expect(text).toContain("LOG_LEVEL");
    expect(text).toContain("Applied");
  });

  it("shows 'No defaults applied' when nothing was applied", () => {
    const env = { PORT: "3000", DEBUG: "true", LOG_LEVEL: "warn" };
    const result = applyDefaults(env, defaults);
    const text = formatDefaultsResult(result);
    expect(text).toContain("No defaults applied");
  });
});

describe("index helpers", () => {
  it("withDefaults returns merged output map", () => {
    const out = withDefaults(baseEnv, defaults);
    expect(out.LOG_LEVEL).toBe("info");
    expect(out.HOST).toBe("localhost");
  });

  it("withDefaultsFull returns full result", () => {
    const result = withDefaultsFull(baseEnv, defaults);
    expect(result.applied).toBeDefined();
    expect(result.skipped).toBeDefined();
  });

  it("missingDefaults returns absent keys", () => {
    expect(missingDefaults(baseEnv, defaults)).toContain("LOG_LEVEL");
  });

  it("hasAllDefaults returns false when keys are missing", () => {
    expect(hasAllDefaults(baseEnv, defaults)).toBe(false);
  });

  it("hasAllDefaults returns true when all keys present", () => {
    const full = { PORT: "3000", DEBUG: "true", LOG_LEVEL: "warn" };
    expect(hasAllDefaults(full, defaults)).toBe(true);
  });
});

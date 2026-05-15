import { castValue, castEnvMap, formatCastResult } from "../envCaster";
import { CastRule } from "../types";

describe("castValue", () => {
  it("casts true-ish strings to boolean true", () => {
    expect(castValue("true", "boolean")).toBe(true);
    expect(castValue("1", "boolean")).toBe(true);
    expect(castValue("yes", "boolean")).toBe(true);
    expect(castValue("on", "boolean")).toBe(true);
  });

  it("casts false-ish strings to boolean false", () => {
    expect(castValue("false", "boolean")).toBe(false);
    expect(castValue("0", "boolean")).toBe(false);
    expect(castValue("no", "boolean")).toBe(false);
    expect(castValue("off", "boolean")).toBe(false);
  });

  it("throws for invalid boolean", () => {
    expect(() => castValue("maybe", "boolean")).toThrow();
  });

  it("casts numeric strings to number", () => {
    expect(castValue("42", "number")).toBe(42);
    expect(castValue("3.14", "number")).toBe(3.14);
  });

  it("throws for non-numeric string with number type", () => {
    expect(() => castValue("abc", "number")).toThrow();
  });

  it("casts to integer", () => {
    expect(castValue("7", "integer")).toBe(7);
    expect(castValue("9.9", "integer")).toBe(9);
  });

  it("casts valid JSON strings", () => {
    expect(castValue('["a","b"]', "json")).toEqual(["a", "b"]);
    expect(castValue('{"x":1}', "json")).toEqual({ x: 1 });
  });

  it("throws for invalid JSON", () => {
    expect(() => castValue("not json", "json")).toThrow();
  });

  it("returns string as-is for string type", () => {
    expect(castValue("hello", "string")).toBe("hello");
  });
});

describe("castEnvMap", () => {
  const env = { PORT: "3000", DEBUG: "true", NAME: "app", BAD: "nope" };

  const rules: CastRule[] = [
    { key: "PORT", type: "integer" },
    { key: "DEBUG", type: "boolean" },
    { key: "BAD", type: "number" },
  ];

  it("casts known keys according to rules", () => {
    const result = castEnvMap(env, rules);
    expect(result.casted["PORT"]).toBe(3000);
    expect(result.casted["DEBUG"]).toBe(true);
  });

  it("records errors for failed casts", () => {
    const result = castEnvMap(env, rules);
    expect(result.errors["BAD"]).toMatch(/Cannot cast/);
  });

  it("tracks changed keys", () => {
    const result = castEnvMap(env, rules);
    expect(result.changed).toContain("PORT");
    expect(result.changed).toContain("DEBUG");
    expect(result.changed).not.toContain("BAD");
  });

  it("skips keys not present in env", () => {
    const result = castEnvMap({}, rules);
    expect(result.changed).toHaveLength(0);
  });
});

describe("formatCastResult", () => {
  it("formats a successful cast result", () => {
    const output = formatCastResult({ casted: {}, errors: {}, changed: ["PORT", "DEBUG"] });
    expect(output).toContain("Cast 2 key(s)");
    expect(output).toContain("PORT");
  });

  it("shows no-op message when nothing changed", () => {
    const output = formatCastResult({ casted: {}, errors: {}, changed: [] });
    expect(output).toContain("No keys were cast");
  });

  it("includes error details", () => {
    const output = formatCastResult({
      casted: {},
      errors: { BAD: "Cannot cast \"nope\" to number" },
      changed: [],
    });
    expect(output).toContain("BAD");
    expect(output).toContain("Cannot cast");
  });
});

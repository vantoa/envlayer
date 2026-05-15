import {
  addAlias,
  removeAlias,
  getAliasesForLayer,
  resolveAliases,
  applyAlias,
  clearAliases,
} from "../envAliaser";
import { EnvMap } from "../../merge/types";

beforeEach(() => {
  clearAliases();
});

describe("addAlias", () => {
  it("creates a new alias entry", () => {
    const entry = addAlias("dev", "DB_URL", "DATABASE_URL");
    expect(entry.alias).toBe("DB_URL");
    expect(entry.target).toBe("DATABASE_URL");
    expect(entry.layer).toBe("dev");
    expect(entry.id).toMatch(/^alias_/);
  });

  it("updates target if alias already exists", () => {
    addAlias("dev", "DB_URL", "DATABASE_URL");
    const updated = addAlias("dev", "DB_URL", "NEW_DATABASE_URL");
    expect(updated.target).toBe("NEW_DATABASE_URL");
    expect(getAliasesForLayer("dev")).toHaveLength(1);
  });
});

describe("removeAlias", () => {
  it("removes an existing alias", () => {
    addAlias("dev", "DB_URL", "DATABASE_URL");
    const removed = removeAlias("dev", "DB_URL");
    expect(removed).toBe(true);
    expect(getAliasesForLayer("dev")).toHaveLength(0);
  });

  it("returns false if alias does not exist", () => {
    expect(removeAlias("dev", "NONEXISTENT")).toBe(false);
  });
});

describe("getAliasesForLayer", () => {
  it("returns only aliases for the given layer", () => {
    addAlias("dev", "DB_URL", "DATABASE_URL");
    addAlias("prod", "API", "API_URL");
    expect(getAliasesForLayer("dev")).toHaveLength(1);
    expect(getAliasesForLayer("prod")).toHaveLength(1);
  });
});

describe("resolveAliases", () => {
  it("injects alias keys into the env map", () => {
    addAlias("dev", "DB_URL", "DATABASE_URL");
    const envMap: EnvMap = { DATABASE_URL: "postgres://localhost" };
    const result = resolveAliases("dev", envMap);
    expect(result["DB_URL"]).toBe("postgres://localhost");
    expect(result["DATABASE_URL"]).toBe("postgres://localhost");
  });

  it("skips alias if target key is missing", () => {
    addAlias("dev", "DB_URL", "DATABASE_URL");
    const envMap: EnvMap = { OTHER_KEY: "value" };
    const result = resolveAliases("dev", envMap);
    expect(result["DB_URL"]).toBeUndefined();
  });
});

describe("applyAlias", () => {
  it("returns resolved value for a known alias", () => {
    addAlias("dev", "DB_URL", "DATABASE_URL");
    const envMap: EnvMap = { DATABASE_URL: "postgres://localhost" };
    const result = applyAlias("dev", "DB_URL", envMap);
    expect(result.applied).toBe(true);
    expect(result.resolvedValue).toBe("postgres://localhost");
  });

  it("returns applied false for unknown alias", () => {
    const result = applyAlias("dev", "MISSING", {});
    expect(result.applied).toBe(false);
    expect(result.resolvedValue).toBeUndefined();
  });
});

/**
 * envCaster.ts — Cast env values to typed primitives
 */

import { CastRule, CastResult, CastType } from "./types";

export function castValue(value: string, type: CastType): unknown {
  switch (type) {
    case "boolean":
      if (["true", "1", "yes", "on"].includes(value.toLowerCase())) return true;
      if (["false", "0", "no", "off"].includes(value.toLowerCase())) return false;
      throw new Error(`Cannot cast "${value}" to boolean`);

    case "number": {
      const n = Number(value);
      if (isNaN(n)) throw new Error(`Cannot cast "${value}" to number`);
      return n;
    }

    case "integer": {
      const i = parseInt(value, 10);
      if (isNaN(i)) throw new Error(`Cannot cast "${value}" to integer`);
      return i;
    }

    case "json":
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`Cannot cast "${value}" to JSON`);
      }

    case "string":
    default:
      return value;
  }
}

export function castEnvMap(
  env: Record<string, string>,
  rules: CastRule[]
): CastResult {
  const casted: Record<string, unknown> = { ...env };
  const errors: Record<string, string> = {};
  const changed: string[] = [];

  for (const rule of rules) {
    const value = env[rule.key];
    if (value === undefined) continue;

    try {
      casted[rule.key] = castValue(value, rule.type);
      changed.push(rule.key);
    } catch (err) {
      errors[rule.key] = (err as Error).message;
    }
  }

  return { casted, errors, changed };
}

export function formatCastResult(result: CastResult): string {
  const lines: string[] = [];

  if (result.changed.length > 0) {
    lines.push(`Cast ${result.changed.length} key(s): ${result.changed.join(", ")}`);
  } else {
    lines.push("No keys were cast.");
  }

  const errKeys = Object.keys(result.errors);
  if (errKeys.length > 0) {
    lines.push(`Errors (${errKeys.length}):`);
    for (const key of errKeys) {
      lines.push(`  ${key}: ${result.errors[key]}`);
    }
  }

  return lines.join("\n");
}

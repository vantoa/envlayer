import { EnvMap } from '../parser/types';

export type CoerceRule = {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'json';
};

export type CoerceResult = {
  coerced: EnvMap;
  changed: string[];
  failed: { key: string; reason: string }[];
};

export function coerceValue(
  value: string,
  type: CoerceRule['type']
): { ok: true; value: string } | { ok: false; reason: string } {
  switch (type) {
    case 'string':
      return { ok: true, value };
    case 'number': {
      const n = Number(value);
      if (isNaN(n)) return { ok: false, reason: `Cannot coerce "${value}" to number` };
      return { ok: true, value: String(n) };
    }
    case 'boolean': {
      const lower = value.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) return { ok: true, value: 'true' };
      if (['false', '0', 'no', 'off'].includes(lower)) return { ok: true, value: 'false' };
      return { ok: false, reason: `Cannot coerce "${value}" to boolean` };
    }
    case 'json': {
      try {
        JSON.parse(value);
        return { ok: true, value };
      } catch {
        try {
          const json = JSON.stringify(value);
          return { ok: true, value: json };
        } catch (e) {
          return { ok: false, reason: `Cannot coerce "${value}" to JSON` };
        }
      }
    }
    default:
      return { ok: false, reason: `Unknown type: ${type}` };
  }
}

export function coerceEnvMap(env: EnvMap, rules: CoerceRule[]): CoerceResult {
  const coerced: EnvMap = { ...env };
  const changed: string[] = [];
  const failed: { key: string; reason: string }[] = [];

  for (const rule of rules) {
    const value = env[rule.key];
    if (value === undefined) continue;

    const result = coerceValue(value, rule.type);
    if (result.ok) {
      if (result.value !== value) {
        coerced[rule.key] = result.value;
        changed.push(rule.key);
      }
    } else {
      failed.push({ key: rule.key, reason: result.reason });
    }
  }

  return { coerced, changed, failed };
}

export function formatCoerceResult(result: CoerceResult): string {
  const lines: string[] = [];
  if (result.changed.length > 0) {
    lines.push(`Coerced ${result.changed.length} key(s): ${result.changed.join(', ')}`);
  } else {
    lines.push('No values were coerced.');
  }
  if (result.failed.length > 0) {
    lines.push(`Failed ${result.failed.length} key(s):`);
    for (const f of result.failed) {
      lines.push(`  ${f.key}: ${f.reason}`);
    }
  }
  return lines.join('\n');
}

import { EnvMap } from '../merge/types';

export interface InheritResult {
  base: string;
  child: string;
  inherited: EnvMap;
  overridden: Record<string, { base: string; child: string }>;
  added: EnvMap;
  finalMap: EnvMap;
}

/**
 * Computes inheritance from a base env map into a child env map.
 * Keys in child override base; keys only in base are inherited.
 */
export function inheritEnvMap(
  base: EnvMap,
  child: EnvMap,
  baseLabel = 'base',
  childLabel = 'child'
): InheritResult {
  const inherited: EnvMap = {};
  const overridden: Record<string, { base: string; child: string }> = {};
  const added: EnvMap = {};
  const finalMap: EnvMap = { ...base };

  for (const [key, value] of Object.entries(child)) {
    if (key in base) {
      if (base[key] !== value) {
        overridden[key] = { base: base[key], child: value };
      }
      finalMap[key] = value;
    } else {
      added[key] = value;
      finalMap[key] = value;
    }
  }

  for (const key of Object.keys(base)) {
    if (!(key in child)) {
      inherited[key] = base[key];
    }
  }

  return {
    base: baseLabel,
    child: childLabel,
    inherited,
    overridden,
    added,
    finalMap,
  };
}

export function formatInheritResult(result: InheritResult): string {
  const lines: string[] = [];
  lines.push(`Inheritance: ${result.base} → ${result.child}`);
  lines.push(`  Inherited:  ${Object.keys(result.inherited).length} key(s)`);
  lines.push(`  Overridden: ${Object.keys(result.overridden).length} key(s)`);
  lines.push(`  Added:      ${Object.keys(result.added).length} key(s)`);
  lines.push(`  Total:      ${Object.keys(result.finalMap).length} key(s)`);

  if (Object.keys(result.overridden).length > 0) {
    lines.push('  Overrides:');
    for (const [key, vals] of Object.entries(result.overridden)) {
      lines.push(`    ${key}: "${vals.base}" → "${vals.child}"`);
    }
  }

  return lines.join('\n');
}

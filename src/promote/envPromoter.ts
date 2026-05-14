import { EnvMap } from '../merge/types';

export interface PromoteOptions {
  keys?: string[];
  overwrite?: boolean;
  dryRun?: boolean;
}

export interface PromoteResult {
  promoted: Record<string, { from: string | undefined; to: string }>;
  skipped: Record<string, string>;
  sourceLayer: string;
  targetLayer: string;
  dryRun: boolean;
}

export function promoteEnvMap(
  source: EnvMap,
  target: EnvMap,
  sourceLayer: string,
  targetLayer: string,
  options: PromoteOptions = {}
): PromoteResult {
  const { keys, overwrite = false, dryRun = false } = options;
  const promoted: PromoteResult['promoted'] = {};
  const skipped: PromoteResult['skipped'] = {};

  const keysToPromote = keys ?? Object.keys(source);

  for (const key of keysToPromote) {
    if (!(key in source)) {
      skipped[key] = 'key not found in source';
      continue;
    }

    if (key in target && !overwrite) {
      skipped[key] = 'already exists in target (use overwrite to force)';
      continue;
    }

    promoted[key] = { from: target[key], to: source[key] };
  }

  return { promoted, skipped, sourceLayer, targetLayer, dryRun };
}

export function applyPromotion(
  target: EnvMap,
  result: PromoteResult
): EnvMap {
  if (result.dryRun) return { ...target };
  const updated = { ...target };
  for (const [key, { to }] of Object.entries(result.promoted)) {
    updated[key] = to;
  }
  return updated;
}

export function formatPromoteResult(result: PromoteResult): string {
  const lines: string[] = [];
  const prefix = result.dryRun ? '[dry-run] ' : '';

  lines.push(`${prefix}Promote: ${result.sourceLayer} → ${result.targetLayer}`);

  const promotedKeys = Object.keys(result.promoted);
  if (promotedKeys.length > 0) {
    lines.push(`  Promoted (${promotedKeys.length}):`);
    for (const key of promotedKeys) {
      const { from } = result.promoted[key];
      const note = from !== undefined ? ` (overwrote: ${from})` : '';
      lines.push(`    + ${key}${note}`);
    }
  }

  const skippedKeys = Object.keys(result.skipped);
  if (skippedKeys.length > 0) {
    lines.push(`  Skipped (${skippedKeys.length}):`);
    for (const key of skippedKeys) {
      lines.push(`    - ${key}: ${result.skipped[key]}`);
    }
  }

  return lines.join('\n');
}

export { diffEnvMaps, formatDiff } from './envDiffer';
export type { EnvDiffEntry, EnvDiffResult, DiffOptions, ChangeKind } from './types';

import { diffEnvMaps, formatDiff } from './envDiffer';
import { DiffOptions, EnvDiffResult } from './types';

/**
 * Compare two env maps and return a structured diff.
 * Secrets are masked by default.
 */
export function compareEnvMaps(
  base: Record<string, string>,
  target: Record<string, string>,
  options: DiffOptions = { maskSecrets: true }
): EnvDiffResult {
  return diffEnvMaps(base, target, options);
}

/**
 * Compare two env maps and return a human-readable diff string.
 */
export function printEnvDiff(
  base: Record<string, string>,
  target: Record<string, string>,
  options: DiffOptions = { maskSecrets: true }
): string {
  const result = diffEnvMaps(base, target, options);
  return formatDiff(result);
}

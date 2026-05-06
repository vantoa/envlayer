export { mergeEnvMaps, mergeMultiple } from './envMerger';
export type { MergeOptions, MergeResult, MergeConflict, MergeStrategy } from './types';
export { DEFAULT_MERGE_OPTIONS } from './types';

import { mergeMultiple } from './envMerger';
import { MergeOptions, MergeResult, DEFAULT_MERGE_OPTIONS } from './types';

/**
 * High-level helper: merges an ordered list of env maps (lowest to highest priority).
 * Each subsequent map overrides the previous according to the chosen strategy.
 */
export function mergeLayerMaps(
  layerMaps: Record<string, string>[],
  options: Partial<MergeOptions> = {}
): MergeResult {
  const resolvedOptions: MergeOptions = { ...DEFAULT_MERGE_OPTIONS, ...options };
  return mergeMultiple(layerMaps, resolvedOptions);
}

import { EnvMap } from '../merge/types';
import {
  promoteEnvMap,
  applyPromotion,
  formatPromoteResult,
  PromoteOptions,
  PromoteResult,
} from './envPromoter';

export type { PromoteOptions, PromoteResult };

/**
 * Promote selected (or all) keys from one env map to another.
 * Returns the updated target map and a result summary.
 */
export function promoteKeys(
  source: EnvMap,
  target: EnvMap,
  sourceLayer: string,
  targetLayer: string,
  options: PromoteOptions = {}
): { result: PromoteResult; updated: EnvMap } {
  const result = promoteEnvMap(source, target, sourceLayer, targetLayer, options);
  const updated = applyPromotion(target, result);
  return { result, updated };
}

/**
 * Dry-run promotion — returns what would change without modifying the target.
 */
export function previewPromotion(
  source: EnvMap,
  target: EnvMap,
  sourceLayer: string,
  targetLayer: string,
  options: Omit<PromoteOptions, 'dryRun'> = {}
): PromoteResult {
  return promoteEnvMap(source, target, sourceLayer, targetLayer, {
    ...options,
    dryRun: true,
  });
}

/**
 * Print a human-readable summary of a promotion result.
 */
export function printPromoteResult(result: PromoteResult): void {
  console.log(formatPromoteResult(result));
}

/**
 * Returns the count of keys that would be (or were) promoted.
 */
export function promotedCount(result: PromoteResult): number {
  return Object.keys(result.promoted).length;
}

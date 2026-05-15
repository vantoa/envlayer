import { applyPatch, formatPatchResult } from './envPatcher';
import type { EnvMap } from '../merge/types';

export interface PatchOperation {
  op: 'set' | 'delete' | 'rename';
  key: string;
  value?: string;
  newKey?: string;
}

export interface PatchResult {
  before: EnvMap;
  after: EnvMap;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

/**
 * Apply a list of patch operations to an env map.
 * Returns the patched map and a result summary.
 */
export function patchEnv(env: EnvMap, ops: PatchOperation[]): PatchResult {
  return applyPatch(env, ops);
}

/**
 * Apply patches and return only the resulting env map.
 */
export function patchEnvMap(env: EnvMap, ops: PatchOperation[]): EnvMap {
  const result = applyPatch(env, ops);
  return result.after;
}

/**
 * Print a human-readable summary of a patch result.
 */
export function printPatchResult(result: PatchResult): void {
  console.log(formatPatchResult(result));
}

/**
 * Count how many operations were successfully applied.
 */
export function appliedCount(result: PatchResult): number {
  return result.applied.length;
}

/**
 * Return keys that were changed (set or renamed) by the patch.
 */
export function changedKeys(result: PatchResult): string[] {
  return result.applied
    .filter((op) => op.op === 'set' || op.op === 'rename')
    .map((op) => (op.op === 'rename' && op.newKey ? op.newKey : op.key));
}

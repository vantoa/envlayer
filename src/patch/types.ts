export type PatchOpType = 'set' | 'delete' | 'rename';

/**
 * Represents a single patch operation to apply to an environment layer.
 *
 * - `set`: Sets `key` to `value` (creates or overwrites).
 * - `delete`: Removes `key` from the layer.
 * - `rename`: Renames `key` to `newKey`, preserving its value.
 */
export interface PatchOperation {
  op: PatchOpType;
  key: string;
  /** Required for 'set' operations */
  value?: string;
  /** Required for 'rename' operations */
  newKey?: string;
}

/**
 * The result of applying a patch to an environment layer.
 *
 * Contains the state of the layer before and after the patch,
 * as well as which operations were successfully applied and which
 * were skipped (e.g. due to missing keys or conflicts).
 */
export interface PatchResult {
  before: Record<string, string>;
  after: Record<string, string>;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

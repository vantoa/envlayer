import { EnvMap } from "../merge/types";
import { renameKey, bulkRename, RenameResult, BulkRenameResult } from "./envRenamer";

export { RenameResult, BulkRenameResult };

/**
 * Rename a single key in an env map. Returns the updated map and a result descriptor.
 * Throws if the key does not exist and throwOnMissing is true.
 */
export function renameEnvKey(
  envMap: EnvMap,
  oldKey: string,
  newKey: string,
  layer = "default",
  options: { overwrite?: boolean; throwOnMissing?: boolean } = {}
): { map: EnvMap; result: RenameResult } {
  const { overwrite = false, throwOnMissing = false } = options;
  const outcome = renameKey(envMap, oldKey, newKey, layer, overwrite);

  if (!outcome.result.success && throwOnMissing && !outcome.result.conflict) {
    throw new Error(outcome.result.message);
  }

  return outcome;
}

/**
 * Rename multiple keys at once. Later renames operate on the result of earlier ones.
 */
export function renameEnvKeys(
  envMap: EnvMap,
  renames: Array<{ oldKey: string; newKey: string }>,
  layer = "default",
  options: { overwrite?: boolean } = {}
): { map: EnvMap; result: BulkRenameResult } {
  return bulkRename(envMap, renames, layer, options.overwrite ?? false);
}

/**
 * Check whether a rename would cause a conflict.
 */
export function wouldConflict(envMap: EnvMap, newKey: string): boolean {
  return Object.prototype.hasOwnProperty.call(envMap, newKey);
}

/**
 * Pretty-print a BulkRenameResult summary.
 */
export function printRenameResult(result: BulkRenameResult): void {
  console.log(
    `Rename complete: ${result.renamed} renamed, ${result.skipped} skipped, ${result.conflicts} conflicts.`
  );
  for (const r of result.results) {
    const icon = r.success ? "✔" : "✘";
    console.log(`  ${icon} ${r.message}`);
  }
}

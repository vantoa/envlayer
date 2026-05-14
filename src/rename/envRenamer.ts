import { EnvMap } from "../merge/types";

export interface RenameResult {
  success: boolean;
  oldKey: string;
  newKey: string;
  layer: string;
  conflict: boolean;
  message: string;
}

export interface BulkRenameResult {
  results: RenameResult[];
  renamed: number;
  skipped: number;
  conflicts: number;
}

export function renameKey(
  envMap: EnvMap,
  oldKey: string,
  newKey: string,
  layer: string,
  overwrite = false
): { map: EnvMap; result: RenameResult } {
  if (!Object.prototype.hasOwnProperty.call(envMap, oldKey)) {
    return {
      map: { ...envMap },
      result: {
        success: false,
        oldKey,
        newKey,
        layer,
        conflict: false,
        message: `Key "${oldKey}" not found in layer "${layer}"`
      }
    };
  }

  const conflict = Object.prototype.hasOwnProperty.call(envMap, newKey);

  if (conflict && !overwrite) {
    return {
      map: { ...envMap },
      result: {
        success: false,
        oldKey,
        newKey,
        layer,
        conflict: true,
        message: `Key "${newKey}" already exists in layer "${layer}". Use overwrite=true to replace.`
      }
    };
  }

  const updated: EnvMap = {};
  for (const [k, v] of Object.entries(envMap)) {
    if (k === oldKey) {
      updated[newKey] = v;
    } else if (k !== newKey || !conflict) {
      updated[k] = v;
    } else {
      // skip old newKey entry when overwriting
    }
  }
  // Ensure newKey is set even if oldKey came after newKey in iteration
  if (!Object.prototype.hasOwnProperty.call(updated, newKey)) {
    updated[newKey] = envMap[oldKey];
  }

  return {
    map: updated,
    result: {
      success: true,
      oldKey,
      newKey,
      layer,
      conflict,
      message: conflict
        ? `Renamed "${oldKey}" to "${newKey}" (overwrote existing key) in layer "${layer}"`
        : `Renamed "${oldKey}" to "${newKey}" in layer "${layer}"`
    }
  };
}

export function bulkRename(
  envMap: EnvMap,
  renames: Array<{ oldKey: string; newKey: string }>,
  layer: string,
  overwrite = false
): { map: EnvMap; result: BulkRenameResult } {
  let current = { ...envMap };
  const results: RenameResult[] = [];

  for (const { oldKey, newKey } of renames) {
    const { map, result } = renameKey(current, oldKey, newKey, layer, overwrite);
    if (result.success) current = map;
    results.push(result);
  }

  return {
    map: current,
    result: {
      results,
      renamed: results.filter(r => r.success).length,
      skipped: results.filter(r => !r.success && !r.conflict).length,
      conflicts: results.filter(r => r.conflict && !r.success).length
    }
  };
}

import { MergeOptions, MergeResult, MergeConflict, DEFAULT_MERGE_OPTIONS } from './types';

export function mergeEnvMaps(
  base: Record<string, string>,
  override: Record<string, string>,
  options: MergeOptions = DEFAULT_MERGE_OPTIONS
): MergeResult {
  const result: Record<string, string> = { ...base };
  const conflicts: MergeConflict[] = [];
  const overriddenKeys: string[] = [];
  const preservedKeys: string[] = [];

  for (const [key, value] of Object.entries(override)) {
    if (key in base && base[key] !== value) {
      const conflict: MergeConflict = {
        key,
        baseValue: base[key],
        overrideValue: value,
      };
      conflicts.push(conflict);

      if (options.strategy === 'error-on-conflict') {
        throw new Error(
          `Merge conflict on key "${key}": base="${base[key]}", override="${value}"`
        );
      } else if (options.strategy === 'override') {
        result[key] = value;
        overriddenKeys.push(key);
      } else if (options.strategy === 'preserve') {
        preservedKeys.push(key);
      }
    } else {
      result[key] = value;
    }
  }

  return { entries: result, conflicts, overriddenKeys, preservedKeys };
}

export function mergeMultiple(
  maps: Record<string, string>[],
  options: MergeOptions = DEFAULT_MERGE_OPTIONS
): MergeResult {
  if (maps.length === 0) {
    return { entries: {}, conflicts: [], overriddenKeys: [], preservedKeys: [] };
  }

  let accumulated = maps[0];
  const allConflicts: MergeConflict[] = [];
  const allOverridden: string[] = [];
  const allPreserved: string[] = [];

  for (let i = 1; i < maps.length; i++) {
    const result = mergeEnvMaps(accumulated, maps[i], options);
    accumulated = result.entries;
    allConflicts.push(...result.conflicts);
    allOverridden.push(...result.overriddenKeys);
    allPreserved.push(...result.preservedKeys);
  }

  return {
    entries: accumulated,
    conflicts: allConflicts,
    overriddenKeys: allOverridden,
    preservedKeys: allPreserved,
  };
}

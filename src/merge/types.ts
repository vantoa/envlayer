export type MergeStrategy = 'override' | 'preserve' | 'error-on-conflict';

export interface MergeOptions {
  strategy: MergeStrategy;
  includeComments?: boolean;
}

export interface MergeConflict {
  key: string;
  baseValue: string;
  overrideValue: string;
}

export interface MergeResult {
  entries: Record<string, string>;
  conflicts: MergeConflict[];
  overriddenKeys: string[];
  preservedKeys: string[];
}

export const DEFAULT_MERGE_OPTIONS: MergeOptions = {
  strategy: 'override',
  includeComments: false,
};

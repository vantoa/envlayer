export type ChangeKind = 'added' | 'removed' | 'modified' | 'unchanged';

export interface EnvDiffEntry {
  key: string;
  kind: ChangeKind;
  oldValue?: string;
  newValue?: string;
}

export interface EnvDiffResult {
  entries: EnvDiffEntry[];
  added: EnvDiffEntry[];
  removed: EnvDiffEntry[];
  modified: EnvDiffEntry[];
  unchanged: EnvDiffEntry[];
  hasChanges: boolean;
}

export interface DiffOptions {
  /** Include unchanged keys in the result entries */
  includeUnchanged?: boolean;
  /** Mask secret values in the diff output */
  maskSecrets?: boolean;
}

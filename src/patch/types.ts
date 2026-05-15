export type PatchOpType = 'set' | 'delete' | 'rename';

export interface PatchOperation {
  op: PatchOpType;
  key: string;
  /** Required for 'set' operations */
  value?: string;
  /** Required for 'rename' operations */
  newKey?: string;
}

export interface PatchResult {
  before: Record<string, string>;
  after: Record<string, string>;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

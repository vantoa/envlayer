export type FlattenSeparator = '.' | '_' | '__' | '/';

export interface FlattenOptions {
  separator?: FlattenSeparator;
  prefix?: string;
  maxDepth?: number;
}

export interface FlattenResult {
  original: Record<string, string>;
  flattened: Record<string, string>;
  keysAdded: string[];
  keysRemoved: string[];
  separator: FlattenSeparator;
}

export interface UnflattenResult {
  original: Record<string, string>;
  unflattened: Record<string, string>;
  keysProcessed: number;
  separator: FlattenSeparator;
}

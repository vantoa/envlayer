export type CompareMode = 'keys' | 'values' | 'full';

export interface CompareOptions {
  mode?: CompareMode;
  ignoreCase?: boolean;
  maskSecrets?: boolean;
}

export interface CompareResult {
  layerA: string;
  layerB: string;
  onlyInA: string[];
  onlyInB: string[];
  inBoth: string[];
  diffValues: Array<{ key: string; valueA: string; valueB: string }>;
  identical: boolean;
}

export interface FormattedCompareResult {
  summary: string;
  details: string[];
}

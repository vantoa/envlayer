export interface InterpolationOptions {
  /** Allow missing variables (default: false) */
  allowMissing?: boolean;
  /** Maximum recursion depth for nested references (default: 10) */
  maxDepth?: number;
  /** Custom fallback value for missing variables */
  fallback?: string;
}

export interface InterpolationResult {
  value: string;
  resolvedRefs: string[];
  missingRefs: string[];
}

export interface InterpolationError {
  key: string;
  message: string;
  circularPath?: string[];
}

export type EnvMap = Record<string, string>;

/**
 * Result of a sanitize operation on an env map.
 */
export interface SanitizeResult {
  /** The sanitized env map with invalid keys removed or renamed */
  sanitized: Record<string, string>;
  /** Keys that were found to be invalid */
  invalidKeys: string[];
  /** Keys that were automatically renamed to valid forms */
  renamedKeys: Array<{ from: string; to: string }>;
  /** Total number of entries processed */
  total: number;
  /** Number of entries that passed validation unchanged */
  clean: number;
}

/**
 * Options controlling sanitize behaviour.
 */
export interface SanitizeOptions {
  /** Remove invalid keys entirely instead of trying to fix them */
  stripInvalid?: boolean;
  /** Only report issues, do not modify the map */
  warnOnly?: boolean;
}

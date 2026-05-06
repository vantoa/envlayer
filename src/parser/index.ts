export { parseEnvContent, serializeEntries } from './envParser';
export { groupEntries } from './types';
export type { EnvEntry, ParseOptions, ParseResult } from './types';

import { parseEnvContent } from './envParser';
import { groupEntries } from './types';
import type { ParseOptions, ParseResult } from './types';

/**
 * High-level helper: parse raw .env content and return a grouped result.
 *
 * @param content - Raw string content of a .env file
 * @param options - Parsing options including secret detection patterns
 * @returns Grouped parse result with all entries, secrets, and plain values
 */
export function parse(content: string, options: ParseOptions = {}): ParseResult {
  const defaultSecretPatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /api_key/i,
    /private/i,
  ];

  const mergedOptions: ParseOptions = {
    ...options,
    secretPatterns: options.secretPatterns ?? defaultSecretPatterns,
  };

  const entries = parseEnvContent(content, mergedOptions);
  return groupEntries(entries);
}

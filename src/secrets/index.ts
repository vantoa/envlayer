export { detectSecret, maskValue, maskEntries } from './secretMasker';
export type {
  SecretMaskOptions,
  MaskedEntry,
  SecretDetectionResult,
} from './types';
export { DEFAULT_SECRET_KEYS, DEFAULT_SECRET_PATTERNS } from './types';

import { maskEntries } from './secretMasker';
import type { SecretMaskOptions, MaskedEntry } from './types';

/**
 * Returns a safe-to-display string representation of env entries,
 * with secret values masked.
 */
export function toSafeDisplay(
  entries: Record<string, string>,
  options: SecretMaskOptions = {}
): string {
  const masked: MaskedEntry[] = maskEntries(entries, options);
  return masked
    .map(({ key, value, masked: isMasked }) => {
      const indicator = isMasked ? ' [masked]' : '';
      return `${key}=${value}${indicator}`;
    })
    .join('\n');
}

import {
  SecretMaskOptions,
  MaskedEntry,
  SecretDetectionResult,
  DEFAULT_SECRET_KEYS,
  DEFAULT_SECRET_PATTERNS,
} from './types';

export function detectSecret(
  key: string,
  options: SecretMaskOptions = {}
): SecretDetectionResult {
  const { keys = DEFAULT_SECRET_KEYS, patterns = DEFAULT_SECRET_PATTERNS } = options;

  const upperKey = key.toUpperCase();
  for (const secretKey of keys) {
    if (upperKey.includes(secretKey.toUpperCase())) {
      return { isSecret: true, reason: 'key-match' };
    }
  }

  for (const pattern of patterns) {
    if (pattern.test(key)) {
      return { isSecret: true, reason: 'pattern-match' };
    }
  }

  return { isSecret: false };
}

export function maskValue(
  value: string,
  options: SecretMaskOptions = {}
): string {
  const { maskChar = '*', visibleChars = 0 } = options;

  if (value.length === 0) return value;

  if (visibleChars > 0 && value.length > visibleChars) {
    const visible = value.slice(-visibleChars);
    const masked = maskChar.repeat(Math.max(4, value.length - visibleChars));
    return `${masked}${visible}`;
  }

  return maskChar.repeat(Math.max(4, value.length));
}

export function maskEntries(
  entries: Record<string, string>,
  options: SecretMaskOptions = {}
): MaskedEntry[] {
  return Object.entries(entries).map(([key, value]) => {
    const detection = detectSecret(key, options);
    if (detection.isSecret) {
      return {
        key,
        value: maskValue(value, options),
        masked: true,
        originalLength: value.length,
      };
    }
    return { key, value, masked: false };
  });
}

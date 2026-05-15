import { EnvMap } from '../merge/types';

export interface MaskOptions {
  maskChar?: string;
  revealChars?: number;
  keys?: string[];
  patterns?: RegExp[];
}

export interface MaskResult {
  masked: EnvMap;
  maskedKeys: string[];
}

const DEFAULT_MASK_CHAR = '*';
const DEFAULT_REVEAL_CHARS = 0;

const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /passphrase/i,
];

export function isSensitiveKey(key: string, patterns: RegExp[] = DEFAULT_SENSITIVE_PATTERNS): boolean {
  return patterns.some((pattern) => pattern.test(key));
}

export function maskString(value: string, maskChar: string = DEFAULT_MASK_CHAR, revealChars: number = DEFAULT_REVEAL_CHARS): string {
  if (value.length === 0) return value;
  if (revealChars <= 0) return maskChar.repeat(Math.max(value.length, 6));
  const visible = value.slice(-revealChars);
  const masked = maskChar.repeat(Math.max(value.length - revealChars, 3));
  return masked + visible;
}

export function maskEnvMap(envMap: EnvMap, options: MaskOptions = {}): MaskResult {
  const {
    maskChar = DEFAULT_MASK_CHAR,
    revealChars = DEFAULT_REVEAL_CHARS,
    keys = [],
    patterns = DEFAULT_SENSITIVE_PATTERNS,
  } = options;

  const masked: EnvMap = {};
  const maskedKeys: string[] = [];

  for (const [key, value] of Object.entries(envMap)) {
    const shouldMask = keys.includes(key) || isSensitiveKey(key, patterns);
    if (shouldMask) {
      masked[key] = maskString(value, maskChar, revealChars);
      maskedKeys.push(key);
    } else {
      masked[key] = value;
    }
  }

  return { masked, maskedKeys };
}

export function formatMaskResult(result: MaskResult): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys were masked.';
  }
  const lines = [`Masked ${result.maskedKeys.length} key(s):`, ...result.maskedKeys.map((k) => `  - ${k}`)];
  return lines.join('\n');
}

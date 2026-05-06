export interface SecretMaskOptions {
  maskChar?: string;
  visibleChars?: number;
  keys?: string[];
  patterns?: RegExp[];
}

export interface MaskedEntry {
  key: string;
  value: string;
  masked: boolean;
  originalLength?: number;
}

export interface SecretDetectionResult {
  isSecret: boolean;
  reason?: 'key-match' | 'pattern-match' | 'explicit';
}

export const DEFAULT_SECRET_KEYS: string[] = [
  'PASSWORD',
  'PASSWD',
  'SECRET',
  'TOKEN',
  'API_KEY',
  'PRIVATE_KEY',
  'AUTH',
  'CREDENTIAL',
  'ACCESS_KEY',
  'SIGNING_KEY',
];

export const DEFAULT_SECRET_PATTERNS: RegExp[] = [
  /private[_-]?key/i,
  /secret[_-]?key/i,
  /api[_-]?token/i,
  /auth[_-]?token/i,
];

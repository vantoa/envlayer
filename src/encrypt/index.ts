import { EncryptionOptions, EncryptionResult } from './types';
import {
  generateKey,
  encryptEnvMap,
  decryptEnvMap,
  encryptValue,
  decryptValue,
} from './envEncryptor';
import { EncryptedValue } from './types';

export { generateKey, encryptValue, decryptValue };

export function encryptEnv(
  envMap: Record<string, string>,
  sensitiveKeys: string[],
  existingKey?: string,
  options: EncryptionOptions = {}
): EncryptionResult {
  const key = existingKey ?? generateKey(options.algorithm);
  const encrypted = encryptEnvMap(envMap, key, sensitiveKeys, options);
  return { key, encrypted };
}

export function decryptEnv(
  encryptedMap: Record<string, EncryptedValue | string>,
  key: string
): Record<string, string> {
  return decryptEnvMap(encryptedMap, key);
}

export function isEncryptedValue(value: unknown): value is EncryptedValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ciphertext' in value &&
    'iv' in value &&
    'tag' in value &&
    'algorithm' in value
  );
}

export function listEncryptedKeys(
  encryptedMap: Record<string, EncryptedValue | string>
): string[] {
  return Object.entries(encryptedMap)
    .filter(([, v]) => isEncryptedValue(v))
    .map(([k]) => k);
}

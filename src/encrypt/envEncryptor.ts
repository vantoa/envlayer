import * as crypto from 'crypto';
import { EncryptedValue, EncryptionAlgorithm, EncryptionOptions } from './types';

const DEFAULT_ALGORITHM: EncryptionAlgorithm = 'aes-256-gcm';
const KEY_LENGTH: Record<EncryptionAlgorithm, number> = {
  'aes-256-gcm': 32,
  'aes-128-gcm': 16,
};

export function generateKey(algorithm: EncryptionAlgorithm = DEFAULT_ALGORITHM): string {
  return crypto.randomBytes(KEY_LENGTH[algorithm]).toString('hex');
}

export function encryptValue(
  value: string,
  key: string,
  options: EncryptionOptions = {}
): EncryptedValue {
  const algorithm = options.algorithm ?? DEFAULT_ALGORITHM;
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv) as crypto.CipherGCM;
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    algorithm,
  };
}

export function decryptValue(encrypted: EncryptedValue, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = Buffer.from(encrypted.iv, 'base64');
  const tag = Buffer.from(encrypted.tag, 'base64');
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
  const decipher = crypto.createDecipheriv(
    encrypted.algorithm,
    keyBuffer,
    iv
  ) as crypto.DecipherGCM;
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
}

export function encryptEnvMap(
  envMap: Record<string, string>,
  key: string,
  sensitiveKeys: string[],
  options: EncryptionOptions = {}
): Record<string, EncryptedValue | string> {
  const result: Record<string, EncryptedValue | string> = {};
  for (const [k, v] of Object.entries(envMap)) {
    result[k] = sensitiveKeys.includes(k) ? encryptValue(v, key, options) : v;
  }
  return result;
}

export function decryptEnvMap(
  encryptedMap: Record<string, EncryptedValue | string>,
  key: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(encryptedMap)) {
    result[k] = typeof v === 'string' ? v : decryptValue(v, key);
  }
  return result;
}

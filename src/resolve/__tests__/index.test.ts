import {
  resolveEnv,
  resolveRequired,
  getMissingKeys,
  isFullyResolved,
} from '../index';
import type { EnvMap } from '../../merge/types';

const base: EnvMap = { APP_NAME: 'myapp', LOG_LEVEL: 'info' };
const override: EnvMap = { LOG_LEVEL: 'debug', DB_URL: 'postgres://localhost/db' };

describe('resolveEnv', () => {
  it('merges layers last-wins', () => {
    const result = resolveEnv([base, override]);
    expect(result.resolved.LOG_LEVEL).toBe('debug');
    expect(result.resolved.APP_NAME).toBe('myapp');
    expect(result.resolved.DB_URL).toBe('postgres://localhost/db');
  });

  it('returns ok=true when no required keys', () => {
    const result = resolveEnv([base]);
    expect(result.ok).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('detects missing required keys', () => {
    const result = resolveEnv([base], { required: ['DB_URL', 'APP_NAME'] });
    expect(result.ok).toBe(false);
    expect(result.missing).toContain('DB_URL');
    expect(result.missing).not.toContain('APP_NAME');
  });

  it('uses fallback values', () => {
    const fallback: EnvMap = { REGION: 'us-east-1' };
    const result = resolveEnv([base], { fallback });
    expect(result.resolved.REGION).toBe('us-east-1');
  });

  it('throws in strict mode when keys are missing', () => {
    expect(() =>
      resolveEnv([base], { required: ['MISSING_KEY'], strict: true })
    ).toThrow('Missing required env keys: MISSING_KEY');
  });

  it('does not throw in strict mode when all keys present', () => {
    expect(() =>
      resolveEnv([base], { required: ['APP_NAME'], strict: true })
    ).not.toThrow();
  });
});

describe('resolveRequired', () => {
  it('returns resolved map when all keys present', () => {
    const resolved = resolveRequired([base, override], ['APP_NAME', 'DB_URL']);
    expect(resolved.APP_NAME).toBe('myapp');
    expect(resolved.DB_URL).toBe('postgres://localhost/db');
  });

  it('throws when required keys are missing', () => {
    expect(() =>
      resolveRequired([base], ['SECRET_KEY'])
    ).toThrow();
  });
});

describe('getMissingKeys', () => {
  it('returns keys not present in map', () => {
    const missing = getMissingKeys(base, ['APP_NAME', 'SECRET']);
    expect(missing).toEqual(['SECRET']);
  });

  it('returns empty array when all keys present', () => {
    const missing = getMissingKeys(base, ['APP_NAME', 'LOG_LEVEL']);
    expect(missing).toHaveLength(0);
  });
});

describe('isFullyResolved', () => {
  it('returns true when all required keys present', () => {
    expect(isFullyResolved(base, ['APP_NAME'])).toBe(true);
  });

  it('returns false when keys are missing', () => {
    expect(isFullyResolved(base, ['APP_NAME', 'MISSING'])).toBe(false);
  });
});

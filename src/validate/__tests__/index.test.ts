import { validateEnv, assertValidEnv, checkRequiredKeys } from '../index';
import type { EnvMap } from '../../merge/types';
import type { ValidationRule } from '../index';

describe('validateEnv', () => {
  const rules: ValidationRule[] = [
    { key: 'DATABASE_URL', required: true },
    { key: 'PORT', required: true, pattern: /^\d+$/ },
    { key: 'NODE_ENV', allowedValues: ['development', 'production', 'test'] },
  ];

  it('returns valid=true when all rules pass', () => {
    const env: EnvMap = {
      DATABASE_URL: 'postgres://localhost/db',
      PORT: '3000',
      NODE_ENV: 'production',
    };
    const result = validateEnv(env, rules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid=false when required key is missing', () => {
    const env: EnvMap = { PORT: '3000' };
    const result = validateEnv(env, rules);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('DATABASE_URL'))).toBe(true);
  });

  it('returns valid=false when pattern does not match', () => {
    const env: EnvMap = {
      DATABASE_URL: 'postgres://localhost/db',
      PORT: 'not-a-number',
    };
    const result = validateEnv(env, rules);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('PORT'))).toBe(true);
  });

  it('returns valid=false when value not in allowedValues', () => {
    const env: EnvMap = {
      DATABASE_URL: 'postgres://localhost/db',
      PORT: '8080',
      NODE_ENV: 'staging',
    };
    const result = validateEnv(env, rules);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('NODE_ENV'))).toBe(true);
  });

  it('accumulates multiple errors when multiple rules fail', () => {
    const env: EnvMap = { PORT: 'not-a-number', NODE_ENV: 'staging' };
    const result = validateEnv(env, rules);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('DATABASE_URL'))).toBe(true);
    expect(result.errors.some((e) => e.includes('PORT'))).toBe(true);
    expect(result.errors.some((e) => e.includes('NODE_ENV'))).toBe(true);
  });
});

describe('assertValidEnv', () => {
  it('does not throw when env is valid', () => {
    const env: EnvMap = { API_KEY: 'abc123' };
    const rules: ValidationRule[] = [{ key: 'API_KEY', required: true }];
    expect(() => assertValidEnv(env, rules)).not.toThrow();
  });

  it('throws with formatted message when env is invalid', () => {
    const env: EnvMap = {};
    const rules: ValidationRule[] = [{ key: 'API_KEY', required: true }];
    expect(() => assertValidEnv(env, rules)).toThrow(
      'Environment validation failed'
    );
  });
});

describe('checkRequiredKeys', () => {
  it('returns valid when all required keys are present', () => {
    const env: EnvMap = { FOO: 'bar', BAZ: 'qux' };
    const result = checkRequiredKeys(env, ['FOO', 'BAZ']);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for missing keys', () => {
    const env: EnvMap = { FOO: 'bar' };
    const result = checkRequiredKeys(env, ['FOO', 'MISSING_KEY']);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('MISSING_KEY');
  });

  it('treats empty string as missing', () => {
    const env: EnvMap = { FOO: '' };
    const result = checkRequiredKeys(env, ['FOO']);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('FOO');
  });
});

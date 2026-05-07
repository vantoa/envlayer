import { validateEnvMap, formatValidationErrors, ValidationRule } from '../envValidator';
import { EnvMap } from '../../merge/types';

describe('validateEnvMap', () => {
  const baseEnv: EnvMap = {
    NODE_ENV: 'production',
    PORT: '8080',
    API_KEY: 'supersecretkey123',
    APP_NAME: 'envlayer',
  };

  it('passes when all required keys are present', () => {
    const rules: ValidationRule[] = [
      { key: 'NODE_ENV', required: true },
      { key: 'PORT', required: true },
    ];
    const result = validateEnvMap(baseEnv, rules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when a required key is missing', () => {
    const rules: ValidationRule[] = [{ key: 'DATABASE_URL', required: true }];
    const result = validateEnvMap(baseEnv, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].key).toBe('DATABASE_URL');
  });

  it('fails when a required key is empty string', () => {
    const env: EnvMap = { ...baseEnv, PORT: '' };
    const rules: ValidationRule[] = [{ key: 'PORT', required: true }];
    const result = validateEnvMap(env, rules);
    expect(result.valid).toBe(false);
  });

  it('validates pattern correctly', () => {
    const rules: ValidationRule[] = [{ key: 'PORT', pattern: /^\d+$/ }];
    const result = validateEnvMap(baseEnv, rules);
    expect(result.valid).toBe(true);
  });

  it('fails on pattern mismatch', () => {
    const env: EnvMap = { ...baseEnv, PORT: 'abc' };
    const rules: ValidationRule[] = [{ key: 'PORT', pattern: /^\d+$/ }];
    const result = validateEnvMap(env, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('pattern');
  });

  it('validates allowedValues', () => {
    const rules: ValidationRule[] = [{ key: 'NODE_ENV', allowedValues: ['development', 'staging', 'production'] }];
    const result = validateEnvMap(baseEnv, rules);
    expect(result.valid).toBe(true);
  });

  it('fails when value not in allowedValues', () => {
    const env: EnvMap = { ...baseEnv, NODE_ENV: 'test' };
    const rules: ValidationRule[] = [{ key: 'NODE_ENV', allowedValues: ['development', 'production'] }];
    const result = validateEnvMap(env, rules);
    expect(result.valid).toBe(false);
  });

  it('validates minLength and maxLength', () => {
    const rules: ValidationRule[] = [{ key: 'API_KEY', minLength: 8, maxLength: 64 }];
    const result = validateEnvMap(baseEnv, rules);
    expect(result.valid).toBe(true);
  });

  it('fails when value is too short', () => {
    const env: EnvMap = { ...baseEnv, API_KEY: 'short' };
    const rules: ValidationRule[] = [{ key: 'API_KEY', minLength: 10 }];
    const result = validateEnvMap(env, rules);
    expect(result.valid).toBe(false);
  });

  it('skips validation for optional missing keys', () => {
    const rules: ValidationRule[] = [{ key: 'OPTIONAL_KEY', pattern: /^\d+$/ }];
    const result = validateEnvMap(baseEnv, rules);
    expect(result.valid).toBe(true);
  });
});

describe('formatValidationErrors', () => {
  it('returns success message when valid', () => {
    const msg = formatValidationErrors({ valid: true, errors: [] });
    expect(msg).toBe('All validations passed.');
  });

  it('formats errors with checkmark symbols', () => {
    const msg = formatValidationErrors({
      valid: false,
      errors: [{ key: 'PORT', message: '"PORT" is required but missing or empty' }],
    });
    expect(msg).toContain('✖');
    expect(msg).toContain('PORT');
  });
});

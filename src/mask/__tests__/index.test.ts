import {
  maskEnv,
  maskIfSensitive,
  getSensitiveKeys,
  hasSensitiveKeys,
} from '../index';

const sampleEnv = {
  APP_NAME: 'envlayer',
  API_KEY: 'super-secret-key',
  DB_PASSWORD: 'p@ssw0rd',
  PORT: '3000',
  SECRET_TOKEN: 'tok_abc123',
  NODE_ENV: 'production',
};

describe('maskEnv', () => {
  it('masks sensitive keys with default placeholder', () => {
    const result = maskEnv(sampleEnv);
    expect(result['API_KEY']).toBe('***');
    expect(result['DB_PASSWORD']).toBe('***');
    expect(result['SECRET_TOKEN']).toBe('***');
  });

  it('preserves non-sensitive values', () => {
    const result = maskEnv(sampleEnv);
    expect(result['APP_NAME']).toBe('envlayer');
    expect(result['PORT']).toBe('3000');
    expect(result['NODE_ENV']).toBe('production');
  });

  it('uses custom placeholder when provided', () => {
    const result = maskEnv(sampleEnv, { placeholder: '[REDACTED]' });
    expect(result['API_KEY']).toBe('[REDACTED]');
  });

  it('respects visibleChars option', () => {
    const result = maskEnv(sampleEnv, { visibleChars: 3 });
    expect(result['API_KEY']).toMatch(/sup/);
  });

  it('masks custom keys provided in options', () => {
    const result = maskEnv(
      { ...sampleEnv, MY_CUSTOM_VAR: 'should-be-hidden' },
      { customKeys: ['MY_CUSTOM_VAR'] }
    );
    expect(result['MY_CUSTOM_VAR']).toBe('***');
  });
});

describe('maskIfSensitive', () => {
  it('masks a sensitive key value', () => {
    expect(maskIfSensitive('API_KEY', 'abc123')).toBe('***');
  });

  it('returns original value for non-sensitive key', () => {
    expect(maskIfSensitive('APP_NAME', 'envlayer')).toBe('envlayer');
  });

  it('masks a custom key', () => {
    expect(maskIfSensitive('MY_VAR', 'value', { customKeys: ['MY_VAR'] })).toBe('***');
  });
});

describe('getSensitiveKeys', () => {
  it('returns only sensitive keys from env map', () => {
    const keys = getSensitiveKeys(sampleEnv);
    expect(keys).toContain('API_KEY');
    expect(keys).toContain('DB_PASSWORD');
    expect(keys).toContain('SECRET_TOKEN');
    expect(keys).not.toContain('APP_NAME');
    expect(keys).not.toContain('PORT');
  });

  it('includes custom keys in results', () => {
    const keys = getSensitiveKeys({ CUSTOM_FIELD: 'x' }, ['CUSTOM_FIELD']);
    expect(keys).toContain('CUSTOM_FIELD');
  });
});

describe('hasSensitiveKeys', () => {
  it('returns true when sensitive keys exist', () => {
    expect(hasSensitiveKeys(sampleEnv)).toBe(true);
  });

  it('returns false when no sensitive keys exist', () => {
    expect(hasSensitiveKeys({ APP_NAME: 'test', PORT: '8080' })).toBe(false);
  });

  it('detects custom sensitive keys', () => {
    expect(hasSensitiveKeys({ MY_FIELD: 'val' }, ['MY_FIELD'])).toBe(true);
  });
});

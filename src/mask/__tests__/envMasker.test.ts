import { isSensitiveKey, maskString, maskEnvMap, formatMaskResult } from '../envMasker';

describe('isSensitiveKey', () => {
  it('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('user_passwd')).toBe(true);
  });

  it('detects token keys', () => {
    expect(isSensitiveKey('API_TOKEN')).toBe(true);
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
  });

  it('detects secret keys', () => {
    expect(isSensitiveKey('APP_SECRET')).toBe(true);
    expect(isSensitiveKey('SECRET_KEY')).toBe(true);
  });

  it('does not flag non-sensitive keys', () => {
    expect(isSensitiveKey('APP_NAME')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
  });

  it('supports custom patterns', () => {
    expect(isSensitiveKey('MY_CUSTOM_FIELD', [/custom/i])).toBe(true);
    expect(isSensitiveKey('APP_NAME', [/custom/i])).toBe(false);
  });
});

describe('maskString', () => {
  it('masks entire string by default', () => {
    expect(maskString('mysecret')).toBe('********');
  });

  it('returns at least 6 mask chars for short values', () => {
    expect(maskString('ab')).toBe('******');
  });

  it('reveals trailing chars when revealChars > 0', () => {
    const result = maskString('mysecret123', '*', 3);
    expect(result.endsWith('123')).toBe(true);
    expect(result.startsWith('***')).toBe(true);
  });

  it('handles empty string', () => {
    expect(maskString('')).toBe('');
  });

  it('supports custom mask char', () => {
    expect(maskString('hello', '#')).toBe('#####');
  });
});

describe('maskEnvMap', () => {
  const env = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'supersecret',
    API_TOKEN: 'tok_abc123',
    PORT: '3000',
  };

  it('masks sensitive keys automatically', () => {
    const { masked, maskedKeys } = maskEnvMap(env);
    expect(masked['APP_NAME']).toBe('myapp');
    expect(masked['PORT']).toBe('3000');
    expect(masked['DB_PASSWORD']).not.toBe('supersecret');
    expect(masked['API_TOKEN']).not.toBe('tok_abc123');
    expect(maskedKeys).toContain('DB_PASSWORD');
    expect(maskedKeys).toContain('API_TOKEN');
  });

  it('masks explicitly listed keys', () => {
    const { masked, maskedKeys } = maskEnvMap(env, { keys: ['PORT'] });
    expect(masked['PORT']).not.toBe('3000');
    expect(maskedKeys).toContain('PORT');
  });

  it('supports custom mask char and revealChars', () => {
    const { masked } = maskEnvMap(env, { maskChar: 'X', revealChars: 2 });
    expect(masked['DB_PASSWORD']?.endsWith('et')).toBe(true);
  });

  it('returns empty maskedKeys when nothing sensitive', () => {
    const { maskedKeys } = maskEnvMap({ APP_NAME: 'test', PORT: '8080' });
    expect(maskedKeys).toHaveLength(0);
  });
});

describe('formatMaskResult', () => {
  it('formats masked keys list', () => {
    const result = formatMaskResult({ masked: {}, maskedKeys: ['DB_PASSWORD', 'API_TOKEN'] });
    expect(result).toContain('2 key(s)');
    expect(result).toContain('DB_PASSWORD');
    expect(result).toContain('API_TOKEN');
  });

  it('returns no-op message when nothing masked', () => {
    const result = formatMaskResult({ masked: {}, maskedKeys: [] });
    expect(result).toBe('No keys were masked.');
  });
});

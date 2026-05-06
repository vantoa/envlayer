import { detectSecret, maskValue, maskEntries } from '../secretMasker';
import { DEFAULT_SECRET_KEYS } from '../types';

describe('detectSecret', () => {
  it('detects keys matching default secret key list', () => {
    expect(detectSecret('DB_PASSWORD').isSecret).toBe(true);
    expect(detectSecret('API_KEY').isSecret).toBe(true);
    expect(detectSecret('AUTH_TOKEN').isSecret).toBe(true);
  });

  it('returns false for non-secret keys', () => {
    expect(detectSecret('PORT').isSecret).toBe(false);
    expect(detectSecret('NODE_ENV').isSecret).toBe(false);
    expect(detectSecret('APP_NAME').isSecret).toBe(false);
  });

  it('detects keys matching custom key list', () => {
    const result = detectSecret('MY_CUSTOM_CRED', { keys: ['CRED'] });
    expect(result.isSecret).toBe(true);
    expect(result.reason).toBe('key-match');
  });

  it('detects keys matching custom patterns', () => {
    const result = detectSecret('MY_SIGNING_SECRET', {
      patterns: [/signing/i],
    });
    expect(result.isSecret).toBe(true);
    expect(result.reason).toBe('pattern-match');
  });
});

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('supersecret')).toBe('***********');
  });

  it('uses custom mask character', () => {
    expect(maskValue('abc', { maskChar: '#' })).toBe('####');
  });

  it('shows trailing visible characters when specified', () => {
    const result = maskValue('supersecret123', { visibleChars: 3 });
    expect(result.endsWith('123')).toBe(true);
    expect(result.startsWith('***')).toBe(true);
  });

  it('returns empty string for empty value', () => {
    expect(maskValue('')).toBe('');
  });

  it('uses minimum mask length of 4', () => {
    expect(maskValue('ab').length).toBeGreaterThanOrEqual(4);
  });
});

describe('maskEntries', () => {
  const entries = {
    NODE_ENV: 'production',
    DB_PASSWORD: 'hunter2',
    PORT: '3000',
    API_KEY: 'sk-abc123',
  };

  it('masks secret entries and leaves others unchanged', () => {
    const result = maskEntries(entries);
    const byKey = Object.fromEntries(result.map((e) => [e.key, e]));

    expect(byKey['NODE_ENV'].masked).toBe(false);
    expect(byKey['NODE_ENV'].value).toBe('production');
    expect(byKey['PORT'].masked).toBe(false);
    expect(byKey['DB_PASSWORD'].masked).toBe(true);
    expect(byKey['DB_PASSWORD'].value).not.toBe('hunter2');
    expect(byKey['API_KEY'].masked).toBe(true);
  });

  it('records original length for masked entries', () => {
    const result = maskEntries(entries);
    const pwEntry = result.find((e) => e.key === 'DB_PASSWORD');
    expect(pwEntry?.originalLength).toBe('hunter2'.length);
  });
});

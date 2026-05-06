import { mergeLayerMaps } from '../index';

describe('mergeLayerMaps', () => {
  it('merges layer maps with default override strategy', () => {
    const base = { NODE_ENV: 'development', PORT: '3000' };
    const staging = { NODE_ENV: 'staging', DEBUG: 'true' };
    const result = mergeLayerMaps([base, staging]);
    expect(result.entries.NODE_ENV).toBe('staging');
    expect(result.entries.PORT).toBe('3000');
    expect(result.entries.DEBUG).toBe('true');
  });

  it('respects preserve strategy passed via options', () => {
    const base = { SECRET: 'base-secret' };
    const override = { SECRET: 'override-secret' };
    const result = mergeLayerMaps([base, override], { strategy: 'preserve' });
    expect(result.entries.SECRET).toBe('base-secret');
    expect(result.preservedKeys).toContain('SECRET');
  });

  it('returns conflict metadata for downstream reporting', () => {
    const base = { API_URL: 'http://localhost' };
    const prod = { API_URL: 'https://api.example.com' };
    const result = mergeLayerMaps([base, prod]);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]).toMatchObject({
      key: 'API_URL',
      baseValue: 'http://localhost',
      overrideValue: 'https://api.example.com',
    });
  });
});

import { filterEnvMap, filterByKeys, filterByPrefix, filterBySuffix, filterByPattern } from '../envFilter';
import { filterEnv, pickKeys, omitKeys, filterByPrefix as indexFilterByPrefix, printFilterResult } from '../index';

const sampleEnv = {
  APP_HOST: 'localhost',
  APP_PORT: '3000',
  DB_HOST: 'db.local',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
  DEBUG: 'true',
};

describe('filterByKeys', () => {
  it('returns only specified keys', () => {
    const result = filterByKeys(sampleEnv, ['APP_HOST', 'DEBUG']);
    expect(result).toEqual({ APP_HOST: 'localhost', DEBUG: 'true' });
  });

  it('ignores missing keys gracefully', () => {
    const result = filterByKeys(sampleEnv, ['MISSING_KEY']);
    expect(result).toEqual({});
  });
});

describe('filterByPrefix', () => {
  it('returns keys matching prefix', () => {
    const result = filterByPrefix(sampleEnv, 'APP_');
    expect(result).toEqual({ APP_HOST: 'localhost', APP_PORT: '3000' });
  });

  it('returns empty map when no match', () => {
    expect(filterByPrefix(sampleEnv, 'XYZ_')).toEqual({});
  });
});

describe('filterBySuffix', () => {
  it('returns keys matching suffix', () => {
    const result = filterBySuffix(sampleEnv, '_PORT');
    expect(result).toEqual({ APP_PORT: '3000', DB_PORT: '5432' });
  });
});

describe('filterByPattern', () => {
  it('returns keys matching regex', () => {
    const result = filterByPattern(sampleEnv, /^DB_/);
    expect(result).toEqual({ DB_HOST: 'db.local', DB_PORT: '5432' });
  });
});

describe('filterEnvMap', () => {
  it('combines multiple filter options', () => {
    const result = filterEnvMap(sampleEnv, { prefix: 'APP_', suffix: '_PORT' });
    expect(result.matched).toEqual({ APP_PORT: '3000' });
    expect(result.matchedCount).toBe(1);
  });

  it('inverts the filter when invert=true', () => {
    const result = filterEnvMap(sampleEnv, { keys: ['DEBUG'], invert: true });
    expect(result.matched).not.toHaveProperty('DEBUG');
    expect(result.excluded).toHaveProperty('DEBUG');
  });

  it('returns all entries when no options given', () => {
    const result = filterEnvMap(sampleEnv, {});
    expect(result.matchedCount).toBe(Object.keys(sampleEnv).length);
    expect(result.excludedCount).toBe(0);
  });
});

describe('index helpers', () => {
  it('pickKeys returns subset', () => {
    expect(pickKeys(sampleEnv, ['DB_HOST'])).toEqual({ DB_HOST: 'db.local' });
  });

  it('omitKeys excludes specified keys', () => {
    const result = omitKeys(sampleEnv, ['SECRET_KEY']);
    expect(result).not.toHaveProperty('SECRET_KEY');
    expect(Object.keys(result).length).toBe(Object.keys(sampleEnv).length - 1);
  });

  it('filterByPrefix with strip removes prefix', () => {
    const result = indexFilterByPrefix(sampleEnv, 'APP_', true);
    expect(result).toHaveProperty('HOST', 'localhost');
    expect(result).toHaveProperty('PORT', '3000');
  });

  it('filterEnv returns matched map', () => {
    const result = filterEnv(sampleEnv, { pattern: /SECRET/ });
    expect(result).toEqual({ SECRET_KEY: 'abc123' });
  });

  it('printFilterResult logs output without throwing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = { matched: { A: '1' }, excluded: {}, matchedCount: 1, excludedCount: 0 };
    expect(() => printFilterResult(result)).not.toThrow();
    spy.mockRestore();
  });
});

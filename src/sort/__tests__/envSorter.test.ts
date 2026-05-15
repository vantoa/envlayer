import { sortEnvMap, formatSortResult } from '../envSorter';
import { sortEnv, sortEnvFull, isSorted, getSortedKeys } from '../index';

const sample: Record<string, string> = {
  ZEBRA: 'z',
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  API_KEY: 'secret',
  APP_VERSION: '1.0',
};

describe('sortEnvMap – alpha asc', () => {
  it('sorts keys alphabetically ascending by default', () => {
    const { newOrder } = sortEnvMap(sample);
    expect(newOrder).toEqual(['API_KEY', 'APP_NAME', 'APP_VERSION', 'DB_HOST', 'ZEBRA']);
  });

  it('marks changed=true when order differs', () => {
    const { changed } = sortEnvMap(sample);
    expect(changed).toBe(true);
  });

  it('marks changed=false when already sorted', () => {
    const already = { A: '1', B: '2', C: '3' };
    expect(sortEnvMap(already).changed).toBe(false);
  });
});

describe('sortEnvMap – alpha desc', () => {
  it('sorts keys descending', () => {
    const { newOrder } = sortEnvMap(sample, { order: 'desc' });
    expect(newOrder[0]).toBe('ZEBRA');
    expect(newOrder[newOrder.length - 1]).toBe('API_KEY');
  });
});

describe('sortEnvMap – key-length', () => {
  it('sorts by key length ascending', () => {
    const { newOrder } = sortEnvMap(sample, { strategy: 'key-length' });
    const lengths = newOrder.map(k => k.length);
    for (let i = 1; i < lengths.length; i++) {
      expect(lengths[i]).toBeGreaterThanOrEqual(lengths[i - 1]);
    }
  });
});

describe('sortEnvMap – insertion', () => {
  it('preserves insertion order', () => {
    const { newOrder, changed } = sortEnvMap(sample, { strategy: 'insertion' });
    expect(newOrder).toEqual(Object.keys(sample));
    expect(changed).toBe(false);
  });
});

describe('sortEnvMap – groupByPrefix', () => {
  it('groups keys sharing a prefix together', () => {
    const { newOrder } = sortEnvMap(sample, { groupByPrefix: true });
    const appIdx = newOrder.findIndex(k => k.startsWith('APP_'));
    const appEnd = newOrder.findLastIndex(k => k.startsWith('APP_'));
    const dbIdx = newOrder.findIndex(k => k.startsWith('DB_'));
    // All APP_ keys should be contiguous
    expect(appEnd - appIdx).toBe(1);
    expect(dbIdx).toBeGreaterThan(appEnd);
  });
});

describe('formatSortResult', () => {
  it('reports no changes when already sorted', () => {
    const result = sortEnvMap({ A: '1', B: '2' });
    expect(formatSortResult(result)).toMatch(/already sorted/i);
  });

  it('reports moved keys', () => {
    const result = sortEnvMap(sample);
    const text = formatSortResult(result);
    expect(text).toMatch(/→/);
  });
});

describe('index helpers', () => {
  it('sortEnv returns plain object', () => {
    const out = sortEnv(sample);
    expect(Object.keys(out)[0]).toBe('API_KEY');
  });

  it('isSorted returns false for unsorted map', () => {
    expect(isSorted(sample)).toBe(false);
  });

  it('isSorted returns true for sorted map', () => {
    expect(isSorted({ A: '1', B: '2', C: '3' })).toBe(true);
  });

  it('getSortedKeys returns key array', () => {
    const keys = getSortedKeys(sample);
    expect(Array.isArray(keys)).toBe(true);
    expect(keys).toHaveLength(Object.keys(sample).length);
  });

  it('sortEnvFull exposes originalOrder', () => {
    const { originalOrder } = sortEnvFull(sample);
    expect(originalOrder).toEqual(Object.keys(sample));
  });
});

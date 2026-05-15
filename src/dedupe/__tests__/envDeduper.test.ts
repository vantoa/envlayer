import { dedupeEnvMap, findDuplicates, formatDedupeResult } from '../envDeduper';

describe('dedupeEnvMap', () => {
  it('removes keys from target that are identical in base', () => {
    const target = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };
    const base = { HOST: 'localhost', PORT: '3000' };
    const { deduped, removedCount } = dedupeEnvMap(target, base);
    expect(deduped).toEqual({ DEBUG: 'true' });
    expect(removedCount).toBe(2);
  });

  it('keeps keys that differ in value', () => {
    const target = { HOST: 'prod.example.com', PORT: '8080' };
    const base = { HOST: 'localhost', PORT: '8080' };
    const { deduped } = dedupeEnvMap(target, base);
    expect(deduped).toEqual({ HOST: 'prod.example.com' });
  });

  it('returns all keys when nothing matches base', () => {
    const target = { FOO: 'bar', BAZ: 'qux' };
    const base = { OTHER: 'value' };
    const { deduped, removedCount } = dedupeEnvMap(target, base);
    expect(deduped).toEqual(target);
    expect(removedCount).toBe(0);
  });

  it('returns empty map when all keys are duplicates', () => {
    const target = { A: '1', B: '2' };
    const base = { A: '1', B: '2' };
    const { deduped, removedCount } = dedupeEnvMap(target, base);
    expect(deduped).toEqual({});
    expect(removedCount).toBe(2);
  });

  it('records duplicate keys in duplicates map', () => {
    const target = { KEY: 'val' };
    const base = { KEY: 'val' };
    const { duplicates } = dedupeEnvMap(target, base);
    expect(duplicates).toHaveProperty('KEY');
    expect(duplicates['KEY']).toEqual(['val']);
  });
});

describe('findDuplicates', () => {
  it('finds key=value tokens present in multiple maps', () => {
    const maps = [
      { HOST: 'localhost', PORT: '3000' },
      { HOST: 'localhost', PORT: '4000' },
    ];
    const result = findDuplicates(maps);
    expect(result).toHaveProperty('HOST=localhost');
    expect(result['HOST=localhost']).toHaveLength(2);
    expect(result).not.toHaveProperty('PORT=3000');
  });

  it('returns empty object when no duplicates exist', () => {
    const maps = [{ A: '1' }, { B: '2' }];
    expect(findDuplicates(maps)).toEqual({});
  });
});

describe('formatDedupeResult', () => {
  it('includes removed count in output', () => {
    const result = { deduped: {}, duplicates: { KEY: ['val'] }, removedCount: 1 };
    const output = formatDedupeResult(result);
    expect(output).toContain('1 duplicate(s) removed');
    expect(output).toContain('KEY');
  });

  it('shows completion message when nothing removed', () => {
    const result = { deduped: { A: '1' }, duplicates: {}, removedCount: 0 };
    const output = formatDedupeResult(result);
    expect(output).toContain('0 duplicate(s) removed');
  });
});

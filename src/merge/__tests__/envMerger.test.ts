import { mergeEnvMaps, mergeMultiple } from '../envMerger';
import { MergeOptions } from '../types';

describe('mergeEnvMaps', () => {
  it('should merge two maps with no conflicts', () => {
    const base = { FOO: 'foo', BAR: 'bar' };
    const override = { BAZ: 'baz' };
    const result = mergeEnvMaps(base, override);
    expect(result.entries).toEqual({ FOO: 'foo', BAR: 'bar', BAZ: 'baz' });
    expect(result.conflicts).toHaveLength(0);
  });

  it('should override conflicting keys with override strategy', () => {
    const base = { FOO: 'original' };
    const override = { FOO: 'updated' };
    const result = mergeEnvMaps(base, override, { strategy: 'override' });
    expect(result.entries.FOO).toBe('updated');
    expect(result.overriddenKeys).toContain('FOO');
    expect(result.conflicts).toHaveLength(1);
  });

  it('should preserve base value with preserve strategy', () => {
    const base = { FOO: 'original' };
    const override = { FOO: 'updated' };
    const result = mergeEnvMaps(base, override, { strategy: 'preserve' });
    expect(result.entries.FOO).toBe('original');
    expect(result.preservedKeys).toContain('FOO');
  });

  it('should throw on conflict with error-on-conflict strategy', () => {
    const base = { FOO: 'original' };
    const override = { FOO: 'updated' };
    const opts: MergeOptions = { strategy: 'error-on-conflict' };
    expect(() => mergeEnvMaps(base, override, opts)).toThrow(/Merge conflict on key "FOO"/);
  });

  it('should not flag conflict when values are identical', () => {
    const base = { FOO: 'same' };
    const override = { FOO: 'same' };
    const result = mergeEnvMaps(base, override);
    expect(result.conflicts).toHaveLength(0);
    expect(result.entries.FOO).toBe('same');
  });
});

describe('mergeMultiple', () => {
  it('should return empty result for empty input', () => {
    const result = mergeMultiple([]);
    expect(result.entries).toEqual({});
    expect(result.conflicts).toHaveLength(0);
  });

  it('should merge multiple maps in order', () => {
    const maps = [
      { A: '1', B: '2' },
      { B: '3', C: '4' },
      { C: '5', D: '6' },
    ];
    const result = mergeMultiple(maps, { strategy: 'override' });
    expect(result.entries).toEqual({ A: '1', B: '3', C: '5', D: '6' });
    expect(result.conflicts).toHaveLength(2);
  });

  it('should accumulate overridden keys across all merges', () => {
    const maps = [{ X: 'a' }, { X: 'b' }, { X: 'c' }];
    const result = mergeMultiple(maps, { strategy: 'override' });
    expect(result.overriddenKeys.filter((k) => k === 'X')).toHaveLength(2);
    expect(result.entries.X).toBe('c');
  });
});

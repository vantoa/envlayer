import { patchEnv, patchEnvMap, appliedCount, changedKeys } from '../index';
import type { PatchOperation } from '../index';

describe('patchEnv', () => {
  const base = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

  it('applies set operations', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'FOO', value: 'updated' }];
    const result = patchEnv(base, ops);
    expect(result.after.FOO).toBe('updated');
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
  });

  it('applies delete operations', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'BAR' }];
    const result = patchEnv(base, ops);
    expect(result.after.BAR).toBeUndefined();
    expect(result.applied).toHaveLength(1);
  });

  it('applies rename operations', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'BAZ', newKey: 'QUX' }];
    const result = patchEnv(base, ops);
    expect(result.after.QUX).toBe('baz');
    expect(result.after.BAZ).toBeUndefined();
    expect(result.applied).toHaveLength(1);
  });

  it('skips delete for missing keys', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'MISSING' }];
    const result = patchEnv(base, ops);
    expect(result.skipped).toHaveLength(1);
    expect(result.applied).toHaveLength(0);
  });

  it('skips rename when newKey conflicts', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'FOO', newKey: 'BAR' }];
    const result = patchEnv(base, ops);
    expect(result.skipped).toHaveLength(1);
  });

  it('preserves before state', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'FOO', value: 'new' }];
    const result = patchEnv(base, ops);
    expect(result.before.FOO).toBe('foo');
    expect(result.after.FOO).toBe('new');
  });
});

describe('patchEnvMap', () => {
  it('returns only the resulting map', () => {
    const env = { A: '1', B: '2' };
    const ops: PatchOperation[] = [{ op: 'set', key: 'A', value: '99' }];
    const result = patchEnvMap(env, ops);
    expect(result).toEqual({ A: '99', B: '2' });
  });
});

describe('appliedCount', () => {
  it('counts applied operations', () => {
    const env = { X: 'x' };
    const ops: PatchOperation[] = [
      { op: 'set', key: 'X', value: 'y' },
      { op: 'delete', key: 'NOPE' },
    ];
    const result = patchEnv(env, ops);
    expect(appliedCount(result)).toBe(1);
  });
});

describe('changedKeys', () => {
  it('returns keys affected by set and rename', () => {
    const env = { A: '1', B: '2', C: '3' };
    const ops: PatchOperation[] = [
      { op: 'set', key: 'A', value: '10' },
      { op: 'rename', key: 'B', newKey: 'D' },
      { op: 'delete', key: 'C' },
    ];
    const result = patchEnv(env, ops);
    const keys = changedKeys(result);
    expect(keys).toContain('A');
    expect(keys).toContain('D');
    expect(keys).not.toContain('C');
  });
});

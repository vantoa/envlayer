import { applyPatch, formatPatchResult, PatchOperation } from '../envPatcher';
import { EnvMap } from '../../merge/types';

describe('applyPatch', () => {
  const base: EnvMap = { APP_ENV: 'development', PORT: '3000', DEBUG: 'true' };

  it('applies a set operation', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'PORT', value: '8080' }];
    const result = applyPatch(base, ops);
    expect(result.patched.PORT).toBe('8080');
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
  });

  it('applies an unset operation', () => {
    const ops: PatchOperation[] = [{ op: 'unset', key: 'DEBUG' }];
    const result = applyPatch(base, ops);
    expect(result.patched.DEBUG).toBeUndefined();
    expect(result.applied).toHaveLength(1);
  });

  it('skips unset if key does not exist', () => {
    const ops: PatchOperation[] = [{ op: 'unset', key: 'NONEXISTENT' }];
    const result = applyPatch(base, ops);
    expect(result.skipped).toHaveLength(1);
    expect(result.applied).toHaveLength(0);
  });

  it('applies a rename operation', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'PORT', newKey: 'HTTP_PORT' }];
    const result = applyPatch(base, ops);
    expect(result.patched.HTTP_PORT).toBe('3000');
    expect(result.patched.PORT).toBeUndefined();
    expect(result.applied).toHaveLength(1);
  });

  it('skips rename if key does not exist', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'MISSING', newKey: 'OTHER' }];
    const result = applyPatch(base, ops);
    expect(result.skipped).toHaveLength(1);
  });

  it('applies default only when key is absent', () => {
    const ops: PatchOperation[] = [
      { op: 'default', key: 'LOG_LEVEL', value: 'info' },
      { op: 'default', key: 'PORT', value: '9999' },
    ];
    const result = applyPatch(base, ops);
    expect(result.patched.LOG_LEVEL).toBe('info');
    expect(result.patched.PORT).toBe('3000');
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
  });

  it('does not mutate the original map', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'PORT', value: '5000' }];
    applyPatch(base, ops);
    expect(base.PORT).toBe('3000');
  });

  it('handles multiple operations in order', () => {
    const ops: PatchOperation[] = [
      { op: 'set', key: 'NEW_KEY', value: 'hello' },
      { op: 'rename', key: 'NEW_KEY', newKey: 'FINAL_KEY' },
    ];
    const result = applyPatch(base, ops);
    expect(result.patched.FINAL_KEY).toBe('hello');
    expect(result.patched.NEW_KEY).toBeUndefined();
    expect(result.applied).toHaveLength(2);
  });
});

describe('formatPatchResult', () => {
  it('formats a patch result with applied and skipped ops', () => {
    const base: EnvMap = { A: '1' };
    const result = applyPatch(base, [
      { op: 'set', key: 'B', value: '2' },
      { op: 'unset', key: 'MISSING' },
    ]);
    const output = formatPatchResult(result);
    expect(output).toContain('1 operation(s)');
    expect(output).toContain('[set]');
    expect(output).toContain('Skipped');
  });
});

import {
  applyTransformRules,
  formatTransformResult,
  getBuiltinTransform,
  matchesRule,
} from '../envTransformer';
import { TransformRule } from '../types';

describe('getBuiltinTransform', () => {
  it('returns uppercase transform', () => {
    const fn = getBuiltinTransform('uppercase');
    expect(fn('hello', 'KEY')).toBe('HELLO');
  });

  it('returns lowercase transform', () => {
    const fn = getBuiltinTransform('lowercase');
    expect(fn('WORLD', 'KEY')).toBe('world');
  });

  it('returns trim transform', () => {
    const fn = getBuiltinTransform('trim');
    expect(fn('  spaces  ', 'KEY')).toBe('spaces');
  });

  it('encodes and decodes base64', () => {
    const encode = getBuiltinTransform('base64encode');
    const decode = getBuiltinTransform('base64decode');
    const encoded = encode('hello', 'K');
    expect(decode(encoded, 'K')).toBe('hello');
  });

  it('encodes and decodes URI components', () => {
    const encode = getBuiltinTransform('urlencode');
    const decode = getBuiltinTransform('urldecode');
    const encoded = encode('hello world', 'K');
    expect(encoded).toBe('hello%20world');
    expect(decode(encoded, 'K')).toBe('hello world');
  });
});

describe('matchesRule', () => {
  it('matches all keys when no key specified', () => {
    expect(matchesRule('ANY_KEY', { fn: (v) => v })).toBe(true);
  });

  it('matches exact string key', () => {
    const rule: TransformRule = { key: 'MY_KEY', fn: (v) => v };
    expect(matchesRule('MY_KEY', rule)).toBe(true);
    expect(matchesRule('OTHER', rule)).toBe(false);
  });

  it('matches regex key', () => {
    const rule: TransformRule = { key: /^DB_/, fn: (v) => v };
    expect(matchesRule('DB_HOST', rule)).toBe(true);
    expect(matchesRule('APP_NAME', rule)).toBe(false);
  });
});

describe('applyTransformRules', () => {
  const env = { NAME: 'alice', HOST: 'localhost', PORT: '3000' };

  it('applies a single rule to all keys', () => {
    const rules: TransformRule[] = [{ fn: (v) => v.toUpperCase() }];
    const result = applyTransformRules(env, rules);
    expect(result.transformed.NAME).toBe('ALICE');
    expect(result.transformed.HOST).toBe('LOCALHOST');
  });

  it('applies a rule only to matching keys', () => {
    const rules: TransformRule[] = [{ key: 'NAME', fn: (v) => v.toUpperCase() }];
    const result = applyTransformRules(env, rules);
    expect(result.transformed.NAME).toBe('ALICE');
    expect(result.transformed.HOST).toBe('localhost');
  });

  it('records changes', () => {
    const rules: TransformRule[] = [{ fn: (v) => v.toUpperCase() }];
    const result = applyTransformRules(env, rules);
    expect(result.changes.some((c) => c.key === 'NAME')).toBe(true);
  });

  it('does not record unchanged values', () => {
    const rules: TransformRule[] = [{ fn: (v) => v }];
    const result = applyTransformRules(env, rules);
    expect(result.changes).toHaveLength(0);
  });

  it('preserves original map', () => {
    const rules: TransformRule[] = [{ fn: (v) => v.toUpperCase() }];
    const result = applyTransformRules(env, rules);
    expect(result.original.NAME).toBe('alice');
  });
});

describe('formatTransformResult', () => {
  it('returns message when no changes', () => {
    const result = applyTransformRules({ A: '1' }, [{ fn: (v) => v }]);
    expect(formatTransformResult(result)).toBe('No transformations applied.');
  });

  it('lists changed keys', () => {
    const result = applyTransformRules({ A: 'hello' }, [{ fn: (v) => v.toUpperCase() }]);
    const output = formatTransformResult(result);
    expect(output).toContain('A');
    expect(output).toContain('hello');
    expect(output).toContain('HELLO');
  });
});

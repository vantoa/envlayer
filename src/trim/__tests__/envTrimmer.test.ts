import { trimValue, trimEnvMap, formatTrimResult } from '../envTrimmer';
import { trimEnv, trimEnvFull, getUntrimmedKeys, isFullyTrimmed } from '../index';

describe('trimValue', () => {
  it('trims leading and trailing spaces', () => {
    expect(trimValue('  hello  ')).toBe('hello');
  });

  it('trims tabs and newlines', () => {
    expect(trimValue('\t value \n')).toBe('value');
  });

  it('returns unchanged string if already trimmed', () => {
    expect(trimValue('clean')).toBe('clean');
  });
});

describe('trimEnvMap', () => {
  const env = { KEY1: '  value1  ', KEY2: 'value2', KEY3: '\t value3' };

  it('trims values by default', () => {
    const result = trimEnvMap(env);
    expect(result['KEY1']).toBe('value1');
    expect(result['KEY3']).toBe('value3');
  });

  it('does not trim keys by default', () => {
    const result = trimEnvMap({ '  KEY  ': 'val' });
    expect(result['  KEY  ']).toBe('val');
  });

  it('trims keys when trimKeys is true', () => {
    const result = trimEnvMap({ '  KEY  ': 'val' }, { trimKeys: true });
    expect(result['KEY']).toBe('val');
  });

  it('skips value trimming when trimValues is false', () => {
    const result = trimEnvMap(env, { trimValues: false });
    expect(result['KEY1']).toBe('  value1  ');
  });
});

describe('formatTrimResult', () => {
  it('identifies changed keys', () => {
    const original = { A: '  x  ', B: 'y' };
    const trimmed = { A: 'x', B: 'y' };
    const result = formatTrimResult(original, trimmed);
    expect(result.changed).toEqual(['A']);
  });

  it('returns empty changed array when nothing changed', () => {
    const env = { A: 'clean' };
    const result = formatTrimResult(env, env);
    expect(result.changed).toHaveLength(0);
  });
});

describe('getUntrimmedKeys', () => {
  it('returns keys with untrimmed values', () => {
    const env = { A: '  val  ', B: 'clean', C: ' leading' };
    expect(getUntrimmedKeys(env)).toEqual(['A', 'C']);
  });
});

describe('isFullyTrimmed', () => {
  it('returns true when all values are trimmed', () => {
    expect(isFullyTrimmed({ A: 'clean', B: 'also clean' })).toBe(true);
  });

  it('returns false when any value has whitespace', () => {
    expect(isFullyTrimmed({ A: 'clean', B: '  not clean  ' })).toBe(false);
  });
});

describe('trimEnvFull', () => {
  it('returns original, trimmed, and changed keys', () => {
    const env = { X: ' hello ', Y: 'world' };
    const result = trimEnvFull(env);
    expect(result.trimmed['X']).toBe('hello');
    expect(result.changed).toContain('X');
    expect(result.changed).not.toContain('Y');
  });
});

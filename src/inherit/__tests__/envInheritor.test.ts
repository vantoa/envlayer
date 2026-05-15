import {
  applyInheritance,
  resolveInherited,
  getInheritedKeys,
  getOverriddenKeys,
  printInheritResult,
} from '../index';
import { inheritEnvMap, formatInheritResult } from '../envInheritor';

const base = { HOST: 'localhost', PORT: '3000', DEBUG: 'false' };
const child = { PORT: '8080', SECRET: 'abc123' };

describe('inheritEnvMap', () => {
  it('inherits keys not present in child', () => {
    const result = inheritEnvMap(base, child);
    expect(result.inherited).toEqual({ HOST: 'localhost', DEBUG: 'false' });
  });

  it('detects overridden keys', () => {
    const result = inheritEnvMap(base, child);
    expect(result.overridden).toEqual({
      PORT: { base: '3000', child: '8080' },
    });
  });

  it('detects added keys from child', () => {
    const result = inheritEnvMap(base, child);
    expect(result.added).toEqual({ SECRET: 'abc123' });
  });

  it('produces correct finalMap', () => {
    const result = inheritEnvMap(base, child);
    expect(result.finalMap).toEqual({
      HOST: 'localhost',
      PORT: '8080',
      DEBUG: 'false',
      SECRET: 'abc123',
    });
  });

  it('uses provided labels', () => {
    const result = inheritEnvMap(base, child, 'dev', 'staging');
    expect(result.base).toBe('dev');
    expect(result.child).toBe('staging');
  });

  it('handles empty child', () => {
    const result = inheritEnvMap(base, {});
    expect(result.finalMap).toEqual(base);
    expect(result.added).toEqual({});
    expect(result.overridden).toEqual({});
  });

  it('handles empty base', () => {
    const result = inheritEnvMap({}, child);
    expect(result.inherited).toEqual({});
    expect(result.added).toEqual(child);
    expect(result.finalMap).toEqual(child);
  });
});

describe('formatInheritResult', () => {
  it('includes summary counts', () => {
    const result = inheritEnvMap(base, child, 'base', 'child');
    const output = formatInheritResult(result);
    expect(output).toContain('Inheritance: base → child');
    expect(output).toContain('Inherited:  2');
    expect(output).toContain('Overridden: 1');
    expect(output).toContain('Added:      1');
  });

  it('lists overridden key details', () => {
    const result = inheritEnvMap(base, child);
    const output = formatInheritResult(result);
    expect(output).toContain('PORT: "3000" → "8080"');
  });
});

describe('index helpers', () => {
  it('resolveInherited returns final map', () => {
    expect(resolveInherited(base, child)).toEqual({
      HOST: 'localhost', PORT: '8080', DEBUG: 'false', SECRET: 'abc123',
    });
  });

  it('getInheritedKeys returns base-only keys', () => {
    expect(getInheritedKeys(base, child)).toEqual(expect.arrayContaining(['HOST', 'DEBUG']));
  });

  it('getOverriddenKeys returns overridden keys', () => {
    expect(getOverriddenKeys(base, child)).toEqual(['PORT']);
  });

  it('printInheritResult logs output', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    printInheritResult(base, child, 'dev', 'staging');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('dev → staging'));
    spy.mockRestore();
  });
});

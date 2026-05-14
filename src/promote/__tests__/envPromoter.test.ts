import { promoteEnvMap, applyPromotion, formatPromoteResult } from '../envPromoter';
import { EnvMap } from '../../merge/types';

const source: EnvMap = { API_URL: 'https://prod.example.com', SECRET: 'abc123', LOG_LEVEL: 'warn' };
const target: EnvMap = { API_URL: 'https://staging.example.com', DEBUG: 'false' };

describe('promoteEnvMap', () => {
  it('promotes all keys by default', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod');
    expect(Object.keys(result.promoted)).toEqual(expect.arrayContaining(['SECRET', 'LOG_LEVEL']));
  });

  it('skips keys already in target when overwrite is false', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod');
    expect(result.skipped['API_URL']).toMatch(/already exists/);
  });

  it('overwrites existing keys when overwrite is true', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod', { overwrite: true });
    expect(result.promoted['API_URL']).toBeDefined();
    expect(result.promoted['API_URL'].from).toBe('https://staging.example.com');
    expect(result.promoted['API_URL'].to).toBe('https://prod.example.com');
  });

  it('promotes only specified keys', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod', { keys: ['LOG_LEVEL'] });
    expect(result.promoted['LOG_LEVEL']).toBeDefined();
    expect(result.promoted['SECRET']).toBeUndefined();
  });

  it('skips keys not found in source', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod', { keys: ['MISSING_KEY'] });
    expect(result.skipped['MISSING_KEY']).toMatch(/not found in source/);
  });

  it('marks dryRun correctly', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod', { dryRun: true });
    expect(result.dryRun).toBe(true);
  });
});

describe('applyPromotion', () => {
  it('applies promoted keys to target', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod', { overwrite: true });
    const updated = applyPromotion(target, result);
    expect(updated['API_URL']).toBe('https://prod.example.com');
    expect(updated['SECRET']).toBe('abc123');
  });

  it('does not modify target on dry-run', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod', { dryRun: true });
    const updated = applyPromotion(target, result);
    expect(updated['SECRET']).toBeUndefined();
    expect(updated['API_URL']).toBe('https://staging.example.com');
  });

  it('does not mutate the original target', () => {
    const original = { ...target };
    const result = promoteEnvMap(source, target, 'staging', 'prod');
    applyPromotion(target, result);
    expect(target).toEqual(original);
  });
});

describe('formatPromoteResult', () => {
  it('includes source and target layer names', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod');
    const output = formatPromoteResult(result);
    expect(output).toContain('staging');
    expect(output).toContain('prod');
  });

  it('lists promoted and skipped keys', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod');
    const output = formatPromoteResult(result);
    expect(output).toContain('Promoted');
    expect(output).toContain('Skipped');
  });

  it('prefixes dry-run output', () => {
    const result = promoteEnvMap(source, target, 'staging', 'prod', { dryRun: true });
    const output = formatPromoteResult(result);
    expect(output).toContain('[dry-run]');
  });
});

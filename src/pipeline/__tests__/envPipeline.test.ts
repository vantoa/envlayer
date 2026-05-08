import { runPipeline, PipelineOptions } from '../envPipeline';
import { EnvMap } from '../../merge/types';

describe('runPipeline', () => {
  const base: EnvMap = {
    APP_NAME: 'myapp',
    PORT: '3000',
  };

  it('returns base map with no options', () => {
    const result = runPipeline(base);
    expect(result.output).toMatchObject({ APP_NAME: 'myapp', PORT: '3000' });
    expect(result.warnings).toHaveLength(0);
  });

  it('merges additional layers', () => {
    const layer: EnvMap = { PORT: '8080', DEBUG: 'true' };
    const result = runPipeline(base, { layers: [layer] });
    expect(result.output.PORT).toBe('8080');
    expect(result.output.DEBUG).toBe('true');
    expect(result.stepsRun).toContain('merge');
  });

  it('resolves interpolations', () => {
    const map: EnvMap = { NAME: 'world', GREETING: 'Hello $NAME' };
    const result = runPipeline(map, { interpolate: true });
    expect(result.output.GREETING).toBe('Hello world');
    expect(result.stepsRun).toContain('interpolate');
  });

  it('applies extra custom steps', () => {
    const upperStep = {
      name: 'uppercase-values',
      transform: (map: EnvMap) =>
        Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.toUpperCase()])),
    };
    const result = runPipeline(base, { extraSteps: [upperStep] });
    expect(result.output.APP_NAME).toBe('MYAPP');
    expect(result.stepsRun).toContain('uppercase-values');
  });

  it('masks secret-looking values when mask is true', () => {
    const map: EnvMap = { API_SECRET: 'supersecretvalue123', APP: 'test' };
    const result = runPipeline(map, { mask: true });
    expect(result.output.API_SECRET).toMatch(/\*+/);
    expect(result.stepsRun).toContain('mask');
  });

  it('does not mutate original base map', () => {
    const original = { ...base };
    runPipeline(base, { layers: [{ PORT: '9999' }] });
    expect(base).toEqual(original);
  });

  it('records all steps run in order', () => {
    const result = runPipeline(base, {
      layers: [{ X: '1' }],
      interpolate: true,
      mask: false,
    });
    expect(result.stepsRun.indexOf('merge')).toBeLessThan(
      result.stepsRun.indexOf('interpolate')
    );
  });
});

import { buildLayerChain, resolveLayers } from '../layerResolver';
import { Layer } from '../types';

const baseLayer: Layer = {
  name: 'base',
  filePath: '.env',
  entries: { APP_NAME: 'myapp', DB_HOST: 'localhost', LOG_LEVEL: 'info' },
};

const stagingLayer: Layer = {
  name: 'staging',
  filePath: '.env.staging',
  entries: { DB_HOST: 'staging-db.internal', LOG_LEVEL: 'debug' },
  parent: 'base',
};

const productionLayer: Layer = {
  name: 'production',
  filePath: '.env.production',
  entries: { DB_HOST: 'prod-db.internal', LOG_LEVEL: 'warn' },
  parent: 'base',
};

describe('buildLayerChain', () => {
  it('builds chain from base to child', () => {
    const chain = buildLayerChain([baseLayer, stagingLayer], 'staging');
    expect(chain.map((l) => l.name)).toEqual(['base', 'staging']);
  });

  it('returns single layer if no parent', () => {
    const chain = buildLayerChain([baseLayer], 'base');
    expect(chain).toHaveLength(1);
    expect(chain[0].name).toBe('base');
  });

  it('throws on unknown layer', () => {
    expect(() => buildLayerChain([baseLayer], 'unknown')).toThrow('unknown');
  });

  it('throws on circular inheritance', () => {
    const a: Layer = { name: 'a', filePath: 'a', entries: {}, parent: 'b' };
    const b: Layer = { name: 'b', filePath: 'b', entries: {}, parent: 'a' };
    expect(() => buildLayerChain([a, b], 'a')).toThrow('Circular');
  });
});

describe('resolveLayers', () => {
  it('child overrides parent by default', () => {
    const stack = resolveLayers([baseLayer, stagingLayer]);
    expect(stack.resolved.DB_HOST).toBe('staging-db.internal');
    expect(stack.resolved.APP_NAME).toBe('myapp');
  });

  it('respects immutableKeys', () => {
    const stack = resolveLayers([baseLayer, stagingLayer], { immutableKeys: ['LOG_LEVEL'] });
    expect(stack.resolved.LOG_LEVEL).toBe('info');
  });

  it('respects childOverrides=false', () => {
    const stack = resolveLayers([baseLayer, productionLayer], { childOverrides: false });
    expect(stack.resolved.DB_HOST).toBe('localhost');
  });

  it('resolves up to a specific layer', () => {
    const stack = resolveLayers([baseLayer, stagingLayer, productionLayer], {
      upToLayer: 'staging',
    });
    expect(stack.layers.map((l) => l.name)).toEqual(['base', 'staging']);
    expect(stack.resolved.DB_HOST).toBe('staging-db.internal');
  });

  it('throws if upToLayer not found', () => {
    expect(() => resolveLayers([baseLayer], { upToLayer: 'missing' })).toThrow('missing');
  });
});

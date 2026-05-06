import { Layer, LayerStack, ResolveOptions } from './types';

/**
 * Builds an ordered list of layers from base to most specific,
 * following the parent chain starting from the given layer.
 */
export function buildLayerChain(layers: Layer[], targetLayer: string): Layer[] {
  const layerMap = new Map<string, Layer>(layers.map((l) => [l.name, l]));
  const chain: Layer[] = [];
  let current = layerMap.get(targetLayer);

  const visited = new Set<string>();
  while (current) {
    if (visited.has(current.name)) {
      throw new Error(`Circular layer inheritance detected at layer: "${current.name}"`);
    }
    visited.add(current.name);
    chain.unshift(current);
    current = current.parent ? layerMap.get(current.parent) : undefined;
  }

  return chain;
}

/**
 * Resolves the final environment variables by merging layers in order.
 * Later layers (children) override earlier ones unless restricted.
 */
export function resolveLayers(layers: Layer[], options: ResolveOptions = {}): LayerStack {
  const { childOverrides = true, immutableKeys = [], upToLayer } = options;

  let orderedLayers = layers;
  if (upToLayer) {
    const idx = layers.findIndex((l) => l.name === upToLayer);
    if (idx === -1) throw new Error(`Layer "${upToLayer}" not found`);
    orderedLayers = layers.slice(0, idx + 1);
  }

  const resolved: Record<string, string> = {};
  const lockedKeys = new Set<string>(immutableKeys);

  for (const layer of orderedLayers) {
    for (const [key, value] of Object.entries(layer.entries)) {
      if (lockedKeys.has(key)) continue;
      if (!childOverrides && key in resolved) continue;
      resolved[key] = value;
    }
  }

  return { layers: orderedLayers, resolved };
}

export { buildLayerChain, resolveLayers } from './layerResolver';
export type { Layer, LayerStack, LayerName, LayerInheritanceOptions, ResolveOptions } from './types';

import * as fs from 'fs';
import { parse } from '../parser';
import { Layer } from './types';
import { buildLayerChain, resolveLayers } from './layerResolver';
import { ResolveOptions } from './types';

/**
 * Loads a layer from a .env file on disk.
 */
export function loadLayer(name: string, filePath: string, parent?: string): Layer {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Layer file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = parse(content);
  const entries: Record<string, string> = {};
  for (const entry of parsed) {
    if (entry.type === 'entry') {
      entries[entry.key] = entry.value;
    }
  }
  return { name, filePath, entries, parent };
}

/**
 * Resolves a set of layers by name, following inheritance chain.
 */
export function resolveLayerStack(
  layers: Layer[],
  targetLayer: string,
  options: ResolveOptions = {}
) {
  const chain = buildLayerChain(layers, targetLayer);
  return resolveLayers(chain, options);
}

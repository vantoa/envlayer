export type LayerName = string;

export interface Layer {
  name: LayerName;
  filePath: string;
  entries: Record<string, string>;
  parent?: LayerName;
}

export interface LayerStack {
  layers: Layer[];
  resolved: Record<string, string>;
}

export interface LayerInheritanceOptions {
  /**
   * If true, child layer values override parent layer values.
   * Defaults to true.
   */
  childOverrides?: boolean;
  /**
   * List of keys that should never be overridden by child layers.
   */
  immutableKeys?: string[];
}

export interface ResolveOptions extends LayerInheritanceOptions {
  /**
   * Layer name to resolve up to (inclusive). If omitted, resolves all layers.
   */
  upToLayer?: LayerName;
}

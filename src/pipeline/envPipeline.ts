import { EnvMap } from '../merge/types';
import { resolveInterpolations } from '../interpolate';
import { mergeLayerMaps } from '../merge';
import { validateEnv } from '../validate';
import { maskEntries } from '../secrets/secretMasker';
import { applyDefaults } from '../schema/schemaValidator';
import { SchemaDefinition } from '../schema/types';
import { EnvEntry } from '../parser/types';

export interface PipelineStep {
  name: string;
  transform: (map: EnvMap) => EnvMap;
}

export interface PipelineOptions {
  layers?: EnvMap[];
  schema?: SchemaDefinition;
  interpolate?: boolean;
  mask?: boolean;
  validate?: boolean;
  extraSteps?: PipelineStep[];
}

export interface PipelineResult {
  output: EnvMap;
  warnings: string[];
  stepsRun: string[];
}

export function runPipeline(base: EnvMap, options: PipelineOptions = {}): PipelineResult {
  const warnings: string[] = [];
  const stepsRun: string[] = [];
  let current: EnvMap = { ...base };

  if (options.layers && options.layers.length > 0) {
    current = mergeLayerMaps([current, ...options.layers]);
    stepsRun.push('merge');
  }

  if (options.schema) {
    const entries: EnvEntry[] = Object.entries(current).map(([key, value]) => ({ key, value }));
    const defaulted = applyDefaults(entries, options.schema);
    current = Object.fromEntries(defaulted.map(e => [e.key, e.value]));
    stepsRun.push('defaults');
  }

  if (options.interpolate !== false) {
    current = resolveInterpolations(current);
    stepsRun.push('interpolate');
  }

  if (options.validate && options.schema) {
    const result = validateEnv(current, Object.keys(options.schema));
    if (!result.valid) {
      warnings.push(...result.errors.map(e => `Validation: ${e}`));
    }
    stepsRun.push('validate');
  }

  if (options.extraSteps) {
    for (const step of options.extraSteps) {
      current = step.transform(current);
      stepsRun.push(step.name);
    }
  }

  if (options.mask) {
    const entries: EnvEntry[] = Object.entries(current).map(([key, value]) => ({ key, value }));
    const masked = maskEntries(entries);
    current = Object.fromEntries(masked.map(e => [e.key, e.value]));
    stepsRun.push('mask');
  }

  return { output: current, warnings, stepsRun };
}

import {
  applyTransformRules,
  formatTransformResult,
  getBuiltinTransform,
} from './envTransformer';
import { TransformRule, TransformResult, BuiltinTransform } from './types';

export function transformEnv(
  envMap: Record<string, string>,
  rules: TransformRule[]
): Record<string, string> {
  return applyTransformRules(envMap, rules).transformed;
}

export function transformEnvFull(
  envMap: Record<string, string>,
  rules: TransformRule[]
): TransformResult {
  return applyTransformRules(envMap, rules);
}

export function applyBuiltin(
  envMap: Record<string, string>,
  transform: BuiltinTransform,
  keyFilter?: string | RegExp
): Record<string, string> {
  const fn = getBuiltinTransform(transform);
  const rule: TransformRule = { fn, key: keyFilter };
  return applyTransformRules(envMap, [rule]).transformed;
}

export function printTransformResult(result: TransformResult): void {
  console.log(formatTransformResult(result));
}

export function changedKeys(result: TransformResult): string[] {
  return result.changes.map((c) => c.key);
}

export { TransformRule, TransformResult, BuiltinTransform };

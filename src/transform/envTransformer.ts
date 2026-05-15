import { TransformFn, TransformRule, TransformResult, TransformChange, BuiltinTransform } from './types';

const builtins: Record<BuiltinTransform, TransformFn> = {
  uppercase: (v) => v.toUpperCase(),
  lowercase: (v) => v.toLowerCase(),
  trim: (v) => v.trim(),
  base64encode: (v) => Buffer.from(v).toString('base64'),
  base64decode: (v) => Buffer.from(v, 'base64').toString('utf8'),
  urlencode: (v) => encodeURIComponent(v),
  urldecode: (v) => decodeURIComponent(v),
};

export function getBuiltinTransform(name: BuiltinTransform): TransformFn {
  return builtins[name];
}

export function matchesRule(key: string, rule: TransformRule): boolean {
  if (!rule.key) return true;
  if (typeof rule.key === 'string') return key === rule.key;
  return rule.key.test(key);
}

export function applyTransformRules(
  envMap: Record<string, string>,
  rules: TransformRule[]
): TransformResult {
  const transformed: Record<string, string> = { ...envMap };
  const changes: TransformChange[] = [];

  for (const [key, value] of Object.entries(envMap)) {
    for (const rule of rules) {
      if (matchesRule(key, rule)) {
        const before = transformed[key];
        const after = rule.fn(before, key);
        if (before !== after) {
          changes.push({ key, before, after });
          transformed[key] = after;
        }
      }
    }
  }

  return { original: envMap, transformed, changes };
}

export function formatTransformResult(result: TransformResult): string {
  if (result.changes.length === 0) {
    return 'No transformations applied.';
  }
  const lines = result.changes.map(
    (c) => `  ${c.key}: "${c.before}" → "${c.after}"`
  );
  return `Transformed ${result.changes.length} key(s):\n${lines.join('\n')}`;
}

import { SortOptions, SortResult, SortStrategy, SortOrder } from './types';

function compareKeys(a: string, b: string, order: SortOrder): number {
  const cmp = a.localeCompare(b);
  return order === 'asc' ? cmp : -cmp;
}

function compareByLength(a: string, b: string, order: SortOrder): number {
  const diff = a.length - b.length;
  return order === 'asc' ? diff : -diff;
}

function sortKeys(
  keys: string[],
  strategy: SortStrategy,
  order: SortOrder
): string[] {
  const copy = [...keys];
  if (strategy === 'insertion') return copy;
  copy.sort((a, b) =>
    strategy === 'key-length'
      ? compareByLength(a, b, order) || compareKeys(a, b, 'asc')
      : compareKeys(a, b, order)
  );
  return copy;
}

function groupByPrefix(
  keys: string[],
  delimiter: string
): string[] {
  const groups: Record<string, string[]> = {};
  const noPrefix: string[] = [];

  for (const key of keys) {
    const idx = key.indexOf(delimiter);
    if (idx > 0) {
      const prefix = key.slice(0, idx);
      (groups[prefix] = groups[prefix] || []).push(key);
    } else {
      noPrefix.push(key);
    }
  }

  const sortedPrefixes = Object.keys(groups).sort();
  return [
    ...noPrefix,
    ...sortedPrefixes.flatMap(p => groups[p]),
  ];
}

export function sortEnvMap(
  env: Record<string, string>,
  options: SortOptions = {}
): SortResult {
  const {
    order = 'asc',
    strategy = 'alpha',
    groupByPrefix: doGroup = false,
    prefixDelimiter = '_',
  } = options;

  const originalOrder = Object.keys(env);
  let newOrder = sortKeys(originalOrder, strategy, order);

  if (doGroup) {
    newOrder = groupByPrefix(newOrder, prefixDelimiter);
  }

  const sorted: Record<string, string> = {};
  for (const key of newOrder) {
    sorted[key] = env[key];
  }

  const changed = originalOrder.some((k, i) => k !== newOrder[i]);

  return { sorted, originalOrder, newOrder, changed };
}

export function formatSortResult(result: SortResult): string {
  if (!result.changed) {
    return 'Already sorted — no changes made.';
  }
  const lines = [`Sorted ${result.newOrder.length} keys:`];
  result.newOrder.forEach((key, i) => {
    const prev = result.originalOrder.indexOf(key);
    if (prev !== i) {
      lines.push(`  ${key}  (${prev + 1} → ${i + 1})`);
    }
  });
  return lines.join('\n');
}

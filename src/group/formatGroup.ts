import { EnvGroup, GroupResult } from './types';

export function formatGroupSummary(group: EnvGroup): string {
  const lines: string[] = [
    `Group: ${group.name}`,
    `  ID:   ${group.id}`,
    `  Keys: ${group.keys.join(', ') || '(none)'}`,
  ];
  if (group.description) {
    lines.push(`  Desc: ${group.description}`);
  }
  lines.push(`  Updated: ${group.updatedAt}`);
  return lines.join('\n');
}

export function formatGroupList(groups: EnvGroup[]): string {
  if (groups.length === 0) return 'No groups defined.';
  return groups
    .map(
      (g) =>
        `• ${g.name} (${g.keys.length} key${g.keys.length !== 1 ? 's' : ''})${
          g.description ? ` — ${g.description}` : ''
        }`
    )
    .join('\n');
}

export function formatGroupResult(result: GroupResult): string {
  const lines: string[] = [`Group: ${result.group.name}`];
  const matchedKeys = Object.keys(result.matched);
  if (matchedKeys.length > 0) {
    lines.push(`  Matched (${matchedKeys.length}): ${matchedKeys.join(', ')}`);
  }
  if (result.missing.length > 0) {
    lines.push(`  Missing (${result.missing.length}): ${result.missing.join(', ')}`);
  }
  return lines.join('\n');
}

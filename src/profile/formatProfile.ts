import { EnvProfile } from './types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function formatProfileSummary(profile: EnvProfile): string {
  const lines: string[] = [
    `Profile: ${profile.name}`,
  ];
  if (profile.description) {
    lines.push(`  Description : ${profile.description}`);
  }
  lines.push(`  Layers      : ${profile.layers.join(', ') || '(none)'}`);
  if (profile.baseDir) {
    lines.push(`  Base Dir    : ${profile.baseDir}`);
  }
  lines.push(`  Created     : ${formatDate(profile.createdAt)}`);
  lines.push(`  Updated     : ${formatDate(profile.updatedAt)}`);
  return lines.join('\n');
}

export function formatProfileList(profiles: EnvProfile[], activeProfile?: string | null): string {
  if (profiles.length === 0) {
    return 'No profiles defined.';
  }
  const lines: string[] = ['Profiles:'];
  for (const profile of profiles) {
    const active = profile.name === activeProfile ? ' (active)' : '';
    const layerCount = profile.layers.length;
    lines.push(`  - ${profile.name}${active}  [${layerCount} layer${layerCount !== 1 ? 's' : ''}]`);
    if (profile.description) {
      lines.push(`      ${profile.description}`);
    }
  }
  return lines.join('\n');
}

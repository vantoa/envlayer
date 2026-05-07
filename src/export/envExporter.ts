import { EnvEntry } from '../parser/types';
import { maskEntries } from '../secrets/secretMasker';

export type ExportFormat = 'dotenv' | 'json' | 'shell';

export interface ExportOptions {
  format: ExportFormat;
  maskSecrets?: boolean;
  includeComments?: boolean;
}

export function exportEntries(
  entries: EnvEntry[],
  options: ExportOptions
): string {
  const { format, maskSecrets = false, includeComments = true } = options;

  const processed = maskSecrets ? maskEntries(entries) : entries;

  switch (format) {
    case 'dotenv':
      return exportAsDotenv(processed, includeComments);
    case 'json':
      return exportAsJson(processed);
    case 'shell':
      return exportAsShell(processed);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function exportAsDotenv(entries: EnvEntry[], includeComments: boolean): string {
  return entries
    .map((entry) => {
      if (entry.type === 'comment') {
        return includeComments ? entry.raw : null;
      }
      if (entry.type === 'blank') {
        return includeComments ? '' : null;
      }
      const val = entry.value ?? '';
      const needsQuotes = /\s|#|"/.test(val);
      const quoted = needsQuotes ? `"${val.replace(/"/g, '\\"')}"` : val;
      return `${entry.key}=${quoted}`;
    })
    .filter((line) => line !== null)
    .join('\n');
}

function exportAsJson(entries: EnvEntry[]): string {
  const obj: Record<string, string> = {};
  for (const entry of entries) {
    if (entry.type === 'entry' && entry.key) {
      obj[entry.key] = entry.value ?? '';
    }
  }
  return JSON.stringify(obj, null, 2);
}

function exportAsShell(entries: EnvEntry[]): string {
  return entries
    .filter((e) => e.type === 'entry' && e.key)
    .map((e) => `export ${e.key}="${(e.value ?? '').replace(/"/g, '\\"')}"`)
    .join('\n');
}

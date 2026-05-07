import { EnvEntry } from '../parser/types';
import { exportEntries, ExportFormat, ExportOptions } from './envExporter';

export { ExportFormat, ExportOptions };

/**
 * Export a list of env entries to the specified format.
 * Optionally masks secrets before exporting.
 */
export function exportEnv(
  entries: EnvEntry[],
  format: ExportFormat,
  options: Partial<Omit<ExportOptions, 'format'>> = {}
): string {
  return exportEntries(entries, {
    format,
    maskSecrets: options.maskSecrets ?? false,
    includeComments: options.includeComments ?? true,
  });
}

/**
 * Convenience: export a plain key-value map to the specified format.
 */
export function exportEnvMap(
  map: Record<string, string>,
  format: ExportFormat,
  options: Partial<Omit<ExportOptions, 'format'>> = {}
): string {
  const entries: EnvEntry[] = Object.entries(map).map(([key, value]) => ({
    type: 'entry',
    key,
    value,
    raw: `${key}=${value}`,
  }));
  return exportEnv(entries, format, options);
}

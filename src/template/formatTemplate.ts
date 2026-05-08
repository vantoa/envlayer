import { EnvTemplate } from './types';

export function formatTemplateSummary(template: EnvTemplate): string {
  const lines: string[] = [];
  lines.push(`Template: ${template.name}`);
  if (template.description) {
    lines.push(`Description: ${template.description}`);
  }
  lines.push(`Created: ${template.createdAt}`);
  lines.push(`Variables (${template.variables.length}):`);
  for (const v of template.variables) {
    const required = v.required ? '[required]' : '[optional]';
    const def = v.defaultValue !== undefined ? ` = ${v.defaultValue}` : '';
    const desc = v.description ? ` — ${v.description}` : '';
    lines.push(`  ${v.name}${def} ${required}${desc}`);
  }
  return lines.join('\n');
}

export function formatTemplateList(templates: EnvTemplate[]): string {
  if (templates.length === 0) return 'No templates defined.';
  return templates
    .map((t) => {
      const varCount = t.variables.length;
      const desc = t.description ? ` — ${t.description}` : '';
      return `• ${t.name}${desc} (${varCount} variable${varCount !== 1 ? 's' : ''})`;
    })
    .join('\n');
}

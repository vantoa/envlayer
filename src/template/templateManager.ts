import { EnvTemplate, TemplateRenderResult, TemplateStore, TemplateVariable } from './types';

const store: TemplateStore = { templates: {} };

export function createTemplate(
  name: string,
  variables: TemplateVariable[],
  description?: string
): EnvTemplate {
  const template: EnvTemplate = {
    name,
    description,
    variables,
    createdAt: new Date().toISOString(),
  };
  store.templates[name] = template;
  return template;
}

export function getTemplate(name: string): EnvTemplate | undefined {
  return store.templates[name];
}

export function listTemplates(): EnvTemplate[] {
  return Object.values(store.templates);
}

export function deleteTemplate(name: string): boolean {
  if (!store.templates[name]) return false;
  delete store.templates[name];
  return true;
}

export function renderTemplate(
  template: EnvTemplate,
  values: Record<string, string>
): TemplateRenderResult {
  const missing: string[] = [];
  const used: string[] = [];
  const lines: string[] = [];

  for (const variable of template.variables) {
    const value = values[variable.name] ?? variable.defaultValue;
    if (value === undefined) {
      if (variable.required) missing.push(variable.name);
      continue;
    }
    used.push(variable.name);
    if (variable.description) {
      lines.push(`# ${variable.description}`);
    }
    lines.push(`${variable.name}=${value}`);
  }

  return { content: lines.join('\n'), missing, used };
}

export function extractVariablesFromContent(content: string): string[] {
  const regex = /\$\{([A-Z_][A-Z0-9_]*)\}/g;
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    found.add(match[1]);
  }
  return Array.from(found);
}

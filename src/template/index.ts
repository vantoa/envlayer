import { TemplateVariable, EnvTemplate, TemplateRenderResult } from './types';
import {
  createTemplate,
  getTemplate,
  listTemplates,
  deleteTemplate,
  renderTemplate,
  extractVariablesFromContent,
} from './templateManager';

export function defineTemplate(
  name: string,
  variables: TemplateVariable[],
  description?: string
): EnvTemplate {
  return createTemplate(name, variables, description);
}

export function applyTemplate(
  name: string,
  values: Record<string, string>
): TemplateRenderResult {
  const template = getTemplate(name);
  if (!template) {
    throw new Error(`Template "${name}" not found`);
  }
  return renderTemplate(template, values);
}

export function removeTemplate(name: string): boolean {
  return deleteTemplate(name);
}

export function getTemplates(): EnvTemplate[] {
  return listTemplates();
}

export function inferTemplate(
  name: string,
  content: string
): EnvTemplate {
  const varNames = extractVariablesFromContent(content);
  const variables: TemplateVariable[] = varNames.map((v) => ({
    name: v,
    required: true,
  }));
  return createTemplate(name, variables);
}

export { EnvTemplate, TemplateVariable, TemplateRenderResult };

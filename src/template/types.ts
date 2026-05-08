export interface TemplateVariable {
  name: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface EnvTemplate {
  name: string;
  description?: string;
  variables: TemplateVariable[];
  createdAt: string;
}

export interface TemplateRenderResult {
  content: string;
  missing: string[];
  used: string[];
}

export interface TemplateStore {
  templates: Record<string, EnvTemplate>;
}

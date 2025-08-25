import Registry from '@fundset/registry' with { type: 'json' };

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  includePackages: string[];
  registryModule: string;
  dependencies: string[];
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  pg: {
    id: 'pg',
    name: 'PostgreSQL',
    description: 'PostgreSQL settlement layer with counter module',
    includePackages: ['pg', 'web'],
    registryModule: 'fundset-pg-counter-module.json',
    dependencies:
      Registry.items.find(item => item.name === 'fundset-pg-settlement-layer')?.dependencies ?? [],
  },
  evm: {
    id: 'evm',
    name: 'EVM',
    description: 'Ethereum Virtual Machine settlement layer with counter module',
    // pg is still needed for Payload CMS
    includePackages: ['pg', 'evm', 'web'],
    registryModule: 'fundset-evm-counter-module.json',
    dependencies:
      Registry.items.find(item => item.name === 'fundset-evm-settlement-layer')?.dependencies ?? [],
  },
};

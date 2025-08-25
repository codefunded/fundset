import { TEMPLATES } from './templates.js';
import { stripFirstFolder } from './utils/stripFirstFolder.js';

// Template filtering function
export function shouldIncludeFile(_filePath: string, template: string): boolean {
  const filePath = stripFirstFolder(_filePath);

  const filePatternsToIgnore = [
    // Common
    'docs/',
    'apps/docs',
    'pnpm-lock.yaml',
    'README.md',
    'packages/web/src/payload-types.ts',
    'packages/web/src/_fundset',
    // PG
    'packages/web/src/app/(app)/api/rpc',
    'packages/web/src/app/(app)/api/auth',
    'packages/web/src/lib/auth.ts',
    'packages/web/src/lib/auth-client.ts',
    'packages/web/src/features/auth/pg',
    'packages/web/drizzle.config.ts',
    // EVM
    'packages/web/src/features/auth/evm',
    'packages/evm/contracts/contracts',
    'packages/evm/contracts/ignition',
    'packages/evm/contracts/test',
    'packages/evm/indexer/src/modules',
  ];

  if (filePatternsToIgnore.some(patternToIgnore => filePath.startsWith(patternToIgnore))) {
    return false;
  }
  if (!filePath.startsWith('packages/')) {
    return true;
  }

  const templateConfig = TEMPLATES[template];
  return templateConfig.includePackages
    .map(packageName => `packages/${packageName}/`)
    .some(packagePath => filePath.startsWith(packagePath));
}

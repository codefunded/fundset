import path from 'path';
import fs from 'fs/promises';
import { TemplateConfig, TEMPLATES } from '../templates.js';

export async function updateRootPackageJson(targetDir: string) {
  const packageJsonPath = path.join(targetDir, 'package.json');

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    // Update the package name
    packageJson.name = path.basename(targetDir);

    // Remove private flag
    delete packageJson.private;
    delete packageJson.bin;
    packageJson.version = '0.0.1';

    // Update scripts to only include relevant ones
    const scripts = packageJson.scripts || {};
    packageJson.scripts = {
      build: scripts.build || 'turbo run build',
      dev: scripts.dev || 'turbo run dev',
      lint: scripts.lint || 'turbo run lint',
      stop: scripts.stop || 'turbo run stop',
      format: scripts.format || 'prettier --write "**/*.{ts,tsx,md}"',
      ['check-types']: scripts['check-types'] || 'turbo run check-types',
    };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch {
    console.warn('Warning: Could not update package.json');
  }
}

export async function updateWebPackageJson(targetDir: string, selectedTemplate: TemplateConfig) {
  const packageJsonPath = path.join(targetDir, 'packages/web/package.json');

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    const notSelectedTemplates = Object.values(TEMPLATES).filter(
      template => template.id !== selectedTemplate.id,
    );

    // Update dependencies to only include relevant ones
    packageJson.dependencies = Object.fromEntries(
      Object.entries(packageJson.dependencies).filter(([key]) => {
        return !notSelectedTemplates.some(template => template.dependencies.includes(key));
      }),
    );

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch {
    console.warn('Warning: Could not update package.json');
  }
}

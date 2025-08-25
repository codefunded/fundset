#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { Octokit } from '@octokit/rest';
import * as tar from 'tar';
import { Readable } from 'stream';
import prompts from 'prompts';
import { spawnSync } from 'child_process';
import { TEMPLATES } from './templates.js';
import { shouldIncludeFile } from './shouldIncludeFile.js';
import { updateRootPackageJson, updateWebPackageJson } from './postinstall/updatePackageJson.js';
import { updatePayloadConfig } from './postinstall/updatePayloadConfig.js';
import { createReadme } from './postinstall/createReadme.js';
import { fixShadcnImports } from './utils/fixShadcnImports.js';
import { getRegistryModuleDependencies } from './utils/getRegistryModuleDependencies.js';
import packageJson from '../package.json' with { type: 'json' };

const program = new Command();
program
  .name('init')
  .description('Initialize a project by copying files from a GitHub repo')
  .argument('[dest]', 'Destination folder', '.')
  .option('-t, --template <template>', 'Template type: pg or evm')
  .option('--registry-url <url>', 'Registry URL', 'https://fundset.vercel.app')
  .action(async (dest, options) => {
    try {
      const octokit = new Octokit();

      let repoPath = 'codefunded/fundset';
      const branch = 'main';
      const [owner, name] = repoPath.split('/');

      if (!options.template) {
        const response = await prompts({
          type: 'select',
          name: 'template',
          message: 'Choose a template:',
          choices: Object.entries(TEMPLATES).map(([key, config]) => ({
            title: `${key}: ${config.description}`,
            value: key,
          })),
        });

        if (!response.template) {
          console.log('Operation cancelled');
          process.exit(1);
        }
        options.template = TEMPLATES[response.template].id;
      }

      // Prepare destination
      const targetDir = path.resolve(dest);
      await fs.ensureDir(targetDir);
      console.log(targetDir);

      console.log(`Downloading ${owner}/${name}@${branch} (template: ${options.template})...`);

      // Download repository as tar.gz
      const archiveResponse = await octokit.repos.downloadTarballArchive({
        owner,
        repo: name,
        ref: branch,
      });

      // Convert the response to a readable stream
      const buffer = Buffer.from(archiveResponse.data as any);
      const stream = Readable.from(buffer);

      console.log('Extracting files...');

      await new Promise<void>((resolve, reject) => {
        const extractStream = tar.x({
          cwd: targetDir,
          filter: (p, entry) => {
            const isDirectory = (entry as tar.ReadEntry).type === 'Directory';

            return !isDirectory && shouldIncludeFile(p, options.template);
          },
          strip: 1,
        });

        stream.pipe(extractStream);

        extractStream.on('end', () => resolve());
        extractStream.on('error', reject);
      });

      const selectedTemplate = TEMPLATES[options.template];

      await updateRootPackageJson(targetDir);
      await updateWebPackageJson(targetDir, selectedTemplate);
      await createReadme(targetDir);
      await updatePayloadConfig(targetDir, selectedTemplate);

      const registryData = await getRegistryModuleDependencies(
        `${options.registryUrl}/r/fundset-${selectedTemplate.id}-counter-module.json`,
      );

      spawnSync(
        'npx',
        [
          '-y',
          'shadcn@latest',
          'add',
          `${options.registryUrl}/r/fundset-${selectedTemplate.id}-counter-module.json`,
        ],
        {
          stdio: 'inherit',
          cwd: path.join(targetDir),
        },
      );

      await fixShadcnImports(
        targetDir,
        `${options.registryUrl}/r/fundset-${selectedTemplate.id}-counter-module.json`,
      );

      for (const [packageName, dependencies] of Object.entries(registryData.dependencies ?? {})) {
        spawnSync('pnpm', ['add', ...dependencies], {
          stdio: 'inherit',
          cwd: path.join(targetDir, 'packages', packageName),
        });
      }

      for (const [packageName, devDependencies] of Object.entries(
        registryData.devDependencies ?? {},
      )) {
        spawnSync('pnpm', ['add', '-D', ...devDependencies], {
          stdio: 'inherit',
          cwd: path.join(targetDir, 'packages', packageName),
        });
      }

      console.log(`\n✅ Successfully initialized in "${targetDir}"`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${targetDir}`);
      console.log(`  pnpm install`);
      console.log(`  pnpm dev`);
    } catch (err) {
      console.error('Error:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('add')
  .description('Add a new module / settlement layer / plugin to the project')
  .argument('url', 'URL of the module / settlement layer / plugin')
  .action(async url => {
    // wraps shadcn ui CLI
    spawnSync('npx', ['-y', 'shadcn@latest', 'add', url], {
      stdio: 'inherit',
    });
  });

program.version(packageJson.version).parse();

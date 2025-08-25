import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Generates a barrel file (index.ts) for a given directory, with .js extensions
 * for ESM. Recursively processes subdirectories and re-exports their barrels.
 * @param dirPath - The directory to scan.
 */
async function generateBarrel(dirPath: string) {
  const files = await fs.readdir(dirPath);
  const exports: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fsSync.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recurse into subdirectory to generate its barrel first
      await generateBarrel(fullPath);
      // Check if the subdirectory now has an index.ts (i.e., it generated exports)
      const subBarrelPath = path.join(fullPath, 'index.ts');
      if (fsSync.existsSync(subBarrelPath)) {
        // Re-export the subdirectory's barrel with .ts extension
        exports.push(`export * from './${file}/index.ts';`);
      }
    } else if (
      file.endsWith('.ts') &&
      file !== 'index.ts' &&
      !file.includes('.test.ts') // Exclude tests, etc.
    ) {
      const moduleName = path.basename(file, '.ts');
      // Export with .js extension for ESM
      exports.push(`export * from './${moduleName}';`);
    }
  }

  if (exports.length > 0) {
    const barrelPath = path.join(dirPath, 'index.ts');
    await fs.writeFile(barrelPath, exports.join('\n') + '\n', 'utf8');
  }
}

generateBarrel(path.join(__dirname, 'src/modules'));

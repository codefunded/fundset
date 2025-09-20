import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import hre from 'hardhat';
import { Abi } from 'viem';

/**
 * Attaches nonpayable to functions in the ABI that don't have a stateMutability. This is needed for viem typesafety to work.
 * @param fullPath the path to the ABI file
 */
const attachNonPayableToFunctionsAbiInFile = async (fullPath: string) => {
  const { default: content } = (await import(fullPath)) as { default: Abi };
  const newContent = content.map(abi => {
    if (abi.type === 'function' && !abi.stateMutability) {
      return {
        ...(abi as unknown as Abi[number]),
        stateMutability: 'nonpayable',
      };
    }
    return abi;
  });
  await fs.writeFile(
    fullPath,
    `export default ${JSON.stringify(newContent, null, 2)} as const;`,
    'utf8',
  );
};

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
      exports.push(`export { default as ${moduleName} } from './${moduleName}.ts';`);

      await attachNonPayableToFunctionsAbiInFile(fullPath);
    }
  }

  if (exports.length > 0) {
    const barrelPath = path.join(dirPath, 'index.ts');
    await fs.writeFile(barrelPath, exports.join('\n') + '\n', 'utf8');
  }
}
const rootPath = hre.config.paths.root;
await generateBarrel(path.join(rootPath, 'abi'));

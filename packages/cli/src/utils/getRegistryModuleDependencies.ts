/**
 * Recursively get the dependencies of a module
 * @param moduleUrl - The URL of the module to get the dependencies of
 * @returns The dependencies of the module
 */
export const getRegistryModuleDependencies = async (
  moduleUrl: string,
): Promise<{
  dependencies: Record<string, string[]>;
  devDependencies: Record<string, string[]>;
}> => {
  const registry = await fetch(moduleUrl);
  const registryData = (await registry.json()) as {
    registryDependencies?: string[];
    meta?: {
      dependencies?: { [packageName: string]: string[] };
      devDependencies?: { [packageName: string]: string[] };
    };
  };

  // Aggregate current level deps
  const deps = { ...registryData?.meta?.dependencies };
  const devDeps = { ...registryData?.meta?.devDependencies };

  // Recursively aggregate from dependencies
  if (registryData.registryDependencies && registryData.registryDependencies.length > 0) {
    for (const depUrl of registryData.registryDependencies) {
      const sub = await getRegistryModuleDependencies(depUrl);
      // Merge dependencies
      for (const [pkg, arr] of Object.entries(sub.dependencies)) {
        deps[pkg] = [...(deps[pkg] ?? []), ...arr];
      }
      for (const [pkg, arr] of Object.entries(sub.devDependencies)) {
        devDeps[pkg] = [...(devDeps[pkg] ?? []), ...arr];
      }
    }
  }

  return { dependencies: deps, devDependencies: devDeps };
};

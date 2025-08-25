// THIS IS A TEMPORARY FIX FOR SHADCN IMPORTS

import { Project } from 'ts-morph';
import path from 'path';

// for some reason the shadcn add command drops "@" from registry imports
export const fixShadcnImports = async (targetDir: string, moduleAddress: string) => {
  const res = await fetch(moduleAddress);
  const data = await res.json();
  data.files.forEach((file: { target: string }) => {
    const destPath = path.join(targetDir, file.target.slice(1));
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(destPath);
    const importDeclarations = sourceFile.getImportDeclarations();
    for (const importDeclaration of importDeclarations) {
      const moduleSpecifier = importDeclaration.getModuleSpecifier();
      const moduleSpecifierText = moduleSpecifier.getText();
      if (moduleSpecifierText.replaceAll('"', '').replaceAll("'", '').startsWith('/')) {
        importDeclaration.set({
          moduleSpecifier: `@${moduleSpecifierText.slice(1, -1)}`,
        });
        sourceFile.saveSync();
      }
    }
  });
  for (const dependency of data.registryDependencies ?? []) {
    await fixShadcnImports(targetDir, dependency);
  }
};

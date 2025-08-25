import { Project, SyntaxKind } from 'ts-morph';
import { TEMPLATES, TemplateConfig } from '../templates.js';
import path from 'path';

export async function updatePayloadConfig(
  targetDir: string,
  template: TemplateConfig,
): Promise<void> {
  const payloadConfigPath = path.join(targetDir, 'packages/web/src/payload.config.ts');
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(payloadConfigPath);

  const exportAssignment = sourceFile.getExportAssignments();
  const expr = exportAssignment[0]?.getExpression();

  if (!expr) throw new Error('Export assignment not found');

  const callExpr = expr.asKindOrThrow(SyntaxKind.CallExpression);
  const arg = callExpr.getArguments()[0];
  const objLit = arg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  const pluginsProp = objLit.getProperty('plugins');
  const pluginsAssignment = pluginsProp?.asKindOrThrow(SyntaxKind.PropertyAssignment);
  const pluginsInitializer = pluginsAssignment?.getInitializerIfKind(
    SyntaxKind.ArrayLiteralExpression,
  );

  if (!pluginsInitializer) throw new Error('Plugins initializer not found');

  const pluginsElements = pluginsInitializer.getElements();
  const pluginsToRemove = Object.values(TEMPLATES).filter(p => template.id !== p.id);

  // remove unnecessary plugins
  for (const el of pluginsElements) {
    if (pluginsToRemove.some(({ id }) => el.getText().startsWith(id))) {
      pluginsInitializer.removeElement(el);
    }
  }

  // remove unnecessary imports
  const importDeclarations = sourceFile.getImportDeclarations();
  for (const importDeclaration of importDeclarations) {
    const moduleSpecifier = importDeclaration.getModuleSpecifier();
    if (pluginsToRemove.some(({ id }) => moduleSpecifier.getText().includes(`${id}/plugin`))) {
      importDeclaration.remove();
    }
  }
  sourceFile.saveSync();
}

import fs from 'fs/promises';
import path from 'path';

export async function createReadme(targetDir: string): Promise<void> {
  const readmeContent = `This project was initialized with Fundset CLI.

## Getting Started

1. Install dependencies:
 \`\`\`bash
 pnpm install
 \`\`\`

2. Start development:
 \`\`\`bash
 pnpm dev
 \`\`\`

## Available Scripts

- \`pnpm dev\` - Start development servers
- \`pnpm build\` - Build all packages
- \`pnpm lint\` - Run linting
- \`pnpm format\` - Format code with Prettier
- \`pnpm check-types\` - Run TypeScript type checking
`;

  await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent);
}

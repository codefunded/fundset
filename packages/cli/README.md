# Fundset CLI

Initialize a [Fundset](https://fundset.vercel.app) monorepo and add modules/layers from the Fundset registry.

## Quick start

```bash
# Initialize in a new folder using the Postgres template
npx fundset my-app -t pg

# Or initialize with the EVM template into the current directory
pnpm dlx fundset . --template evm

# Add a module/layer later (wraps shadcn add)
npx fundset add https://fundset.vercel.app/r/fundset-evm-counter-module.json
```

## Commands

### init (default)

```bash
fundset [dest] [options]
```

- **dest**: target directory (defaults to `.`)
- **-t, --template <template>**: `pg` or `evm`. If omitted, you'll be prompted.
- **--registry-url <url>**: defaults to `https://fundset.vercel.app`.

What it does (in order):

- Downloads `codefunded/fundset@main` as a tarball and extracts only files for the chosen template.
- Runs post-install edits:
  - updates root `package.json` and `packages/web/package.json`.
  - updates `payload.config.ts`.
  - creates a root README for the new project.
- Fetches registry metadata for the Counter module from `${registryUrl}/r/fundset-<template>-counter-module.json`.
- Installs the module via `npx -y shadcn@latest add <registry-json-url>`.
- Fixes shadcn imports to match the workspace.
- Installs any extra per-package dependencies returned by the registry metadata using `pnpm add` inside `packages/<pkg>`.
- Prints next steps.

Non-interactive usage example:

```bash
fundset init ./my-app --template pg
```

### add

```bash
fundset add <url>
```

Thin wrapper around `shadcn add`. Useful for adding modules/blocks later.

```bash
fundset add https://fundset.vercel.app/r/fundset-pg-counter-module.json
```

## Examples

```bash
# Create a Postgres template app in my-app/
npx fundset my-app -t pg

# Create an EVM template app in the current directory
npx fundset . -t evm

# Add a module after init
npx fundset add https://fundset.vercel.app/r/fundset-evm-counter-module.json
```

## Requirements

- Node.js 22 and a POSIX-like shell.
- `pnpm` available on your PATH (the CLI uses it to install deps inside packages).
- Network access to GitHub and the registry URL you pass.

## Notes

- If you omit `--template`, an interactive selector appears.
- Default registry URL is `https://fundset.vercel.app`; override with `--registry-url` for self-hosted registries.
- The binary name is `fundset`; the default command is the `init` flow. Use `fundset --help` for details.

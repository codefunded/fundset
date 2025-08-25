# Shadcn CLI compatible registry for Fundset modules

In order to build the registry, you need to run this command in `packages/registry` directory:

```bash
pnpx shadcn@latest build
```

This will build the registry json files into `public/r` directory. This can be then served on any static file server.

To serve the registry, you can run:

```bash
pnpm run serve
```

This will serve the registry on `http://localhost:2137`.

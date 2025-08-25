# Fundset

Fundset is an open-source ecosystem for building composable, settlement layer agnostic applications with reusable vertical modules that span the entire stack - from backend business logic through CMS to frontend UI. Instead of building everything from scratch, install pre-built modules directly into your repo with the fundset CLI, then customize them as needed. The code lives in your repository, so you own it completely.

Built on the shadcn/ui distribution model, Fundset modules are self-contained pieces of functionality that work end-to-end after installation. Need a fundraising page? Install the fundraising module. Want user authentication? Install the auth module. Each module includes database schemas, backend APIs, CMS integrations, and React components - all working together out of the box.

The settlement layer abstraction means you can swap between PostgreSQL, EVM blockchains, or any other backend without changing your UI code. Write once, deploy anywhere. Perfect for projects that need to pivot between Web2 and Web3, or for teams that want to experiment with different backends without rebuilding their frontend.

## 🚀 Features

- ✅ Settlement layer agnostic: Swap between PostgreSQL, EVM chains, or any backend without changing UI code

- 🏗 Modular and extensible architecture

- 📦 Pre-configured backend and frontend scaffolding

- 🎨 Fully customizable and extensible UI that you own

## 🧠 Use Cases

- Crowdfunding platforms

- Launchpads

- Tokenized equity or bond issuance

- Real-world asset tokenization

- Loyalty points or reward systems

- Community investment DAOs

- Marketplaces

- Subscription and membership platforms

- Event ticketing and access control

- Supply chain and inventory tracking

- Decentralized identity and reputation systems

## 🚀 Quick Start

### prerequisites

- Node.js 22+
- pnpm
- Docker

### commands

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Run linting
pnpm lint

# Check types
pnpm check-types

# stop docker containers after running dev
pnpm stop
```

## 📦 Project Structure

### Core Architecture

Fundset uses a monorepo structure with packages that provide infrastructure for different settlement layers and a CLI for module distribution.

### Packages

- **web**: Next.js application with Payload CMS, TanStack Query, and shadcn/ui components. Contains the `_fundset` directory where settlement layers and modules are installed
- **evm**: EVM settlement layer implementation
  - **indexer**: GraphQL-based blockchain data indexing service for real-time on-chain data
  - **contracts**: Smart contracts, deployment scripts, and Hardhat configuration
- **pg**: PostgreSQL settlement layer with Docker setup
- **registry**: module registry containing module definitions for the fundset CLI (uses shadcn/ui registry format)
- **cli**: Command-line tool for installing modules, plugins, and settlement layers into your project

### Key Directories

- **`_fundset/`**: Where all Fundset-specific code lives in your web app
  - **`settlement-layer/`**: Settlement layer implementations and module definitions
  - **`base-plugin/`**: Core Payload CMS plugin for settlement layer management
  - **`config/`**: Server-side settlement layer configuration helpers

### Settlement Layers

Currently, fundset supports **PostgreSQL** and **EVM-compatible blockchains** out of the box. You can easily implement your own settlement layer or request a new integration by following our [settlement layer implementation guide](/docs/settlement-layer) or starting a [GitHub discussion](https://github.com/codefunded/fundset/discussions).

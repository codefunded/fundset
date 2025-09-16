import chokidar from 'chokidar';
import { network } from 'hardhat';
import { deploy } from '../../../deploy/produciton.ts';
import { spawnSync } from 'node:child_process';
import { serializeContractDeploymentResult } from '../serialize-contract-deployment-result.ts';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * HOT CONTRACT RELOAD
 * This function is used to reload the contracts in the development environment.
 * It cleans the hardhat artifacts, builds the contracts, redeploys the contracts
 * on a sol file change.
 */
async function reload() {
  console.log(`[HCR] Building`);
  spawnSync('pnpm', ['build'], { stdio: 'inherit' });
  console.log(`[HCR] Building done`);

  console.log(`[HCR] Redeploying...`);
  await fs.rm(path.resolve(import.meta.dirname, '../../../ignition/deployments/chain-31337'), {
    force: true,
    recursive: true,
  });
  const networkConnection = await network.connect({ network: 'dev' });
  const { viem } = networkConnection;
  const [deployer] = await viem.getWalletClients();
  const result = await deploy(networkConnection, deployer.account.address);
  console.log(`[HCR] Redeploying done`);
  console.log(`[HCR] Sending new data to seed the database`);
  await fetch('http://localhost:3000/api/evm/hot-contract-reload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(serializeContractDeploymentResult(result)),
  });
  console.log(`[HCR] Sending reload message to server`);
  await fetch('http://localhost:9999');
  console.log(
    `[HCR] Redeployment done ✅. Reload the page to see the changes! 🔄 http://localhost:3000`,
  );
}

export async function startHotContractReload() {
  const watcher = chokidar.watch('contracts', {
    ignoreInitial: true,
  });

  let isRunning = false;
  const queue: string[] = [];

  async function drain() {
    if (isRunning) return;
    isRunning = true;
    try {
      while (queue.length) {
        const file = queue.shift()!;
        console.log(`[HCR] Detected change in ${file}. Reloading...`);
        await reload();
      }
    } finally {
      isRunning = false;
    }
  }

  watcher.on('change', file => {
    queue.push(file);
    void drain();
  });

  console.log('[HCR] HCR watcher started.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startHotContractReload().catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}

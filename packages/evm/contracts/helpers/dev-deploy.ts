import fs from 'node:fs/promises';

import { deployDevelopment } from '../deploy/development.ts';
import path from 'node:path';
import { waitForNetworkToBeReady } from './utils/wait-for-network-ready.ts';
import { runBundler } from './utils/run-bundler.ts';
import { startPaymaster } from './utils/paymaster/index.ts';
import { mineBlocks } from './utils/mine-blocks.ts';
import { serializeContractDeploymentResult } from './utils/serialize-contract-deployment-result.ts';

async function deployContracts() {
  const contracts = await deployDevelopment();
  const serializedContracts = serializeContractDeploymentResult(contracts);

  await fs.writeFile(
    'localhost_deployed_contracts.json',
    JSON.stringify(serializedContracts, null, 2),
  );
  console.log('Deployed contracts saved to localhost_deployed_contracts.json');
}

async function clearDevDeploymentCache() {
  await fs.rm(path.join(import.meta.dirname, '..', './ignition/deployments/chain-31337'), {
    force: true,
    recursive: true,
  });
}

async function main() {
  await clearDevDeploymentCache();
  await waitForNetworkToBeReady();
  await deployContracts();
  await runBundler();
  await startPaymaster();
  await mineBlocks();
}
main();

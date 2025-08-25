// @ts-ignore
import { setTimeout } from 'node:timers/promises';
// @ts-ignore
import { spawnSync } from 'node:child_process';
// @ts-ignore
import fs from 'node:fs';

import { convert } from '@catalystic/json-to-yaml';
import * as viem from 'viem';
import { hardhat } from 'viem/chains';
import { Abi } from 'viem';

async function waitForNetworkToBeReady(client: viem.PublicClient) {
  while (true) {
    try {
      await client.getBlockNumber();
      break;
    } catch {
      await setTimeout(100);
    }
  }
}

type DeployedContracts = Record<
  string,
  { address: string; abi: Abi; facets: { name: string; abi: Abi }[] }
>;

const getDeployedContracts = async () => {
  while (true) {
    try {
      const contracts = (await import(
        // @ts-ignore
        '../contracts/localhost_deployed_contracts.json'
      ).then(res => res.default)) as DeployedContracts;
      return contracts;
    } catch (error) {
      console.error(error);
      await setTimeout(1000);
    }
  }
};

const generateConfigFile = async (contracts: DeployedContracts) => {
  const config = await import('./config-template.json').then(res => res.default);
  const contractsArrayInTemplate = config.networks.at(0)?.contracts as {
    name: string;
    address: string[];
    handler: string;
    events: { event: string }[];
  }[];
  for (const [contractName, contractData] of Object.entries(contracts)) {
    const newContract = {
      name: contractName,
      address: [contractData.address],
      handler: 'src/EventHandlers.ts',
      events: contractData.abi
        .filter(abi => abi.type === 'event')
        .map(abi => ({
          event: viem.toEventSignature(abi),
        }))
        .concat(
          contractData.facets.flatMap(facet =>
            facet.abi
              .filter(abi => abi.type === 'event')
              .map(abi => ({
                event: viem.toEventSignature(abi),
              })),
          ),
        ),
    };
    contractsArrayInTemplate?.push(newContract);
  }
  return config;
};

async function main() {
  await waitForNetworkToBeReady(
    viem.createPublicClient({
      chain: hardhat,
      transport: viem.http('http://127.0.0.1:8545'),
    }),
  );
  const contracts = await getDeployedContracts();
  const config = await generateConfigFile(contracts);
  const yaml = convert(config);
  fs.writeFileSync('config.yaml', yaml);
  spawnSync('npx', ['envio', 'codegen'], { stdio: 'inherit' });
}

main();

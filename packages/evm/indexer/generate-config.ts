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

const formatEventSignatureWithIndexedClause = (abi: viem.AbiItem) => {
  if (abi.type !== 'event') {
    throw new Error('Abi is not an event');
  }

  const inputs = abi.inputs.map(input => {
    if (input.type === 'tuple[]' || input.type === 'tuple') {
      type Input = { components: { type: string; name: string }[] };
      return `(${(input as unknown as Input)?.components?.map(component => component.type).join(', ')})[]${input.name ? ` ${input.name}` : ''}`;
    }

    return input.indexed
      ? `${input.type} indexed${input.name ? ` ${input.name}` : ''}`
      : `${input.type}${input.name ? ` ${input.name}` : ''}`;
  });

  return `${abi.name}(${inputs.join(', ')})`;
};

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
  { contract: string; abi: Abi; facets: { name: string; abi: Abi }[] }
>;

const getDeployedContracts = async () => {
  while (true) {
    try {
      const contracts = (await import(
        // @ts-ignore
        '../contracts/localhost_deployed_contracts.json'
      ).then(res => res.default)) as DeployedContracts;
      return contracts;
    } catch {
      console.log('Waiting for contracts to be deployed...');
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
      address: [contractData.contract],
      handler: 'src/EventHandlers.ts',
      events: contractData.abi
        .filter(abi => abi.type === 'event')
        .map(abi => ({
          event: formatEventSignatureWithIndexedClause(abi),
        }))
        .concat(
          contractData.facets.flatMap(facet =>
            facet.abi
              .filter(abi => abi.type === 'event')
              .map(abi => ({
                event: formatEventSignatureWithIndexedClause(abi),
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

import path from 'node:path';
import { network } from 'hardhat';
import { NetworkConnection } from 'hardhat/types/network';
import { Address } from 'viem';
import DiamondProxyModule from '../ignition/modules/DiamondProxy.ts';
import CounterVersionsModule from '../ignition/modules/CounterVersions.ts';
import ERC20Module from '../ignition/modules/ERC20.ts';

export const deploy = async (networkConnection: NetworkConnection, deployerAddress: Address) => {
  // @ts-ignore
  const { ignition } = networkConnection;

  const { diamondProxy } = await ignition.deploy(DiamondProxyModule, {
    defaultSender: deployerAddress,
    displayUi: true,
  });
  const { counterV1, counterV2 } = await ignition.deploy(CounterVersionsModule, {
    defaultSender: deployerAddress,
    displayUi: true,
  });
  const { erc20 } = await ignition.deploy(ERC20Module, {
    defaultSender: deployerAddress,
    displayUi: true,
  });

  return {
    DiamondProxy: {
      contract: diamondProxy,
      facets: {
        CounterV1: counterV1,
        CounterV2: counterV2,
      },
    },
    ERC20: {
      contract: erc20,
    },
  };
};

const isDirect =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1] === path.resolve(import.meta.dirname, '../node_modules/hardhat/dist/src/cli.js'); // hardhat cli

if (isDirect) {
  const networkConnection = await network.connect({ network: 'sepolia' });
  // @ts-ignore
  const [deployer] = await networkConnection.viem.getWalletClients();
  deploy(networkConnection, deployer.account.address).then(console.log).catch(console.error);
}

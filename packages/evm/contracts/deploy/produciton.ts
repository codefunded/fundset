import { network } from 'hardhat';
import DiamondProxyModule from '../ignition/modules/DiamondProxy.ts';
import CounterVersionsModule from '../ignition/modules/CounterVersions.ts';
import ERC20Module from '../ignition/modules/ERC20.ts';
import { NetworkConnection } from 'hardhat/types/network';
import path from 'node:path';

type Deployer = Awaited<
  ReturnType<Awaited<ReturnType<typeof network.connect>>['viem']['getWalletClients']>
>[0];

export const deploy = async (networkConnection: NetworkConnection, deployer: Deployer) => {
  const { ignition } = networkConnection;

  const { diamondProxy } = await ignition.deploy(DiamondProxyModule, {
    defaultSender: deployer.account.address,
    displayUi: true,
  });
  const { counterV1, counterV2 } = await ignition.deploy(CounterVersionsModule, {
    defaultSender: deployer.account.address,
    displayUi: true,
  });
  const { erc20 } = await ignition.deploy(ERC20Module, {
    defaultSender: deployer.account.address,
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
  const [deployer] = await networkConnection.viem.getWalletClients();
  deploy(networkConnection, deployer).then(console.log).catch(console.error);
}

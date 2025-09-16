import { network } from 'hardhat';
import { deployAAContracts } from '../helpers/utils/deploy-aa-contracts.ts';
import { deploy } from './produciton.ts';

export async function deployDevelopment() {
  const networkConnection = await network.connect({ network: 'dev' });
  const { viem } = networkConnection;

  const [, fundsetModulesDeployer] = await viem.getWalletClients();

  const result = await deploy(networkConnection, fundsetModulesDeployer.account.address);

  await deployAAContracts();

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  deployDevelopment().catch(console.error);
}

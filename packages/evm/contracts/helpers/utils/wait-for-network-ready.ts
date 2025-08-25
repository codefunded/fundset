import { hardhat } from 'viem/chains';
import * as viem from 'viem';

export async function waitForNetworkToBeReady(
  client: viem.PublicClient = viem.createPublicClient({
    chain: hardhat,
    transport: viem.http('http://127.0.0.1:8545'),
  }),
) {
  while (true) {
    try {
      await client.getBlockNumber();
      break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  return client;
}

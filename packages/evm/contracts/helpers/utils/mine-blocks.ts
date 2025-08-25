import { network } from 'hardhat';

export const mineBlocks = async () => {
  const { viem } = await network.connect({ network: 'dev' });
  const testClient = await viem.getTestClient({
    mode: 'anvil',
  });
  while (true) {
    await testClient.mine({ blocks: 1, interval: 0 });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

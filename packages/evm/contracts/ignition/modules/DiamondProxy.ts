import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export const DiamondProxyModule = buildModule('DiamondProxyModule', m => {
  const diamondProxy = m.contract('DiamondProxy');

  return { diamondProxy };
});

export default DiamondProxyModule;

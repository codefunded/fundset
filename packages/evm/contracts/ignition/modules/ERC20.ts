import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export const ERC20Module = buildModule('ERC20Module', m => {
  const erc20 = m.contract('ERC20', ['Test', 'TEST']);

  return { erc20 };
});

export default ERC20Module;

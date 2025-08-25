import type { HardhatUserConfig } from 'hardhat/config';

import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import HardhatAbiExporter from '@solidstate/hardhat-abi-exporter';
import { configVariable } from 'hardhat/config';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin, HardhatAbiExporter],
  abiExporter: {
    clear: true,
    runOnCompile: true,
    spacing: 2,
    path: './abi',
    format: 'typescript',
    except: [/.*\.t.sol/],
    rename: (sourceName, contractName) => {
      return `${sourceName.replace('contracts/', '')}/${contractName}`;
    },
  },
  solidity: {
    profiles: {
      default: {
        version: '0.8.28',
        settings: {
          // viaIR: true,
        },
      },
      production: {
        version: '0.8.28',
        settings: {
          // viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
    hardhatOp: {
      type: 'edr-simulated',
      chainType: 'op',
    },
    dev: {
      type: 'http',
      url: 'http://127.0.0.1:8545',
    },
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('SEPOLIA_PRIVATE_KEY')],
    },
  },
};

export default config;

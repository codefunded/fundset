import { Web3AuthNoModal } from '@web3auth/no-modal';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { hardhat } from 'wagmi/chains';

import {
  AuthAdapter,
  type LANGUAGE_TYPE,
  type LOGIN_PROVIDER_TYPE,
  type MfaLevelType,
} from '@web3auth/auth-adapter';
import { createWeb3AuthConnector } from './create';
import type { EvmAccountAbstractionModule } from '../../config.type';
import { evmSettlementLayerEnv } from '../../env';

type Web3AuthInstanceConfig = {
  chainId: number;
  rpcUrl: string;
  displayName: string;
  blockExplorerUrl?: string;
};

export const SESSION_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days

const getWeb3AuthInstance = ({
  chainId,
  rpcUrl,
  displayName,
  blockExplorerUrl,
}: Web3AuthInstanceConfig) => {
  const clientId = evmSettlementLayerEnv().NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is not set');
  }

  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x' + chainId.toString(16),
    rpcTarget: rpcUrl,
    displayName,
    tickerName: hardhat.nativeCurrency?.name,
    ticker: hardhat.nativeCurrency?.symbol,
    blockExplorerUrl: blockExplorerUrl,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040',
  };

  const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

  const web3AuthInstance = new Web3AuthNoModal({
    clientId,
    chainConfig,
    privateKeyProvider,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  });

  return web3AuthInstance;
};

export type Web3AuthNoModalConnectorConfig = {
  whiteLabel?: {
    logoLight: string;
    logoDark: string;
    defaultLanguage: LANGUAGE_TYPE;
    appName: string;
    theme: {
      primary: string;
      onPrimary: string;
    };
    mode: 'dark' | 'light';
    appUrl: string;
  };
  loginParams?: {
    loginProvider: LOGIN_PROVIDER_TYPE;
    mfaLevel: MfaLevelType;
  };
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const createWeb3AuthNoModalConnector = (
  props: Web3AuthInstanceConfig &
    Web3AuthNoModalConnectorConfig & {
      accountAbstractionConfigs: (EvmAccountAbstractionModule & { chainId: number })[];
    },
) => {
  const web3AuthInstance = getWeb3AuthInstance(props);

  const clientId = evmSettlementLayerEnv().NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is not set');
  }

  const authAdapter = new AuthAdapter({
    sessionTime: SESSION_TIME,
    adapterSettings: {
      clientId,
      network: 'testnet',
      uxMode: 'popup',
      whiteLabel: props.whiteLabel ?? {
        logoLight: 'https://codefunded.com/images/codefunded-logo-default.svg',
        logoDark: 'https://codefunded.com/images/codefunded-logo-dark.svg',
        defaultLanguage: 'en',
        appName: 'CodeFunded',
        theme: {
          primary: '#FF4A14',
          onPrimary: '#1C1E1D',
        },
        mode: 'dark',
        appUrl: 'https://codefunded.com',
      },
    },
  });
  web3AuthInstance.configureAdapter(authAdapter);

  return createWeb3AuthConnector({
    web3AuthInstance,
    id: `web3auth-${props.loginParams?.loginProvider}`,
    name: capitalize(props.loginParams?.loginProvider ?? ''),
    loginParams: {
      loginProvider: props.loginParams?.loginProvider ?? 'google',
      curve: 'secp256k1',
      mfaLevel: props.loginParams?.mfaLevel ?? 'none',
    },
    accountAbstractionConfigs: props.accountAbstractionConfigs,
  });
};

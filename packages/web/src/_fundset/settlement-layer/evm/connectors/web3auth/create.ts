import type { IProvider } from '@web3auth/base';
import {
  createPublicClient,
  getAddress,
  http,
  SwitchChainError,
  UserRejectedRequestError,
  type Chain,
  type EIP1193Provider,
} from 'viem';
import { ChainNotConfiguredError, createConnector } from 'wagmi';
import { ADAPTER_STATUS, CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base';
import { toKernelSmartAccount } from 'permissionless/accounts';
import { createSmartAccountClient, type SmartAccountClient } from 'permissionless';
import { type Web3AuthConnectorParams } from '@web3auth/web3auth-wagmi-connector';
import { entryPoint07Address } from 'viem/account-abstraction';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import type { EvmAccountAbstractionModule } from '../../config.type';
import { Web3AuthNoModalConnectorConfig } from './base';

type SmartAccountConnector = ReturnType<
  Parameters<typeof createConnector<SmartAccountClient>>[0]
> & {
  getEoaProvider: () => Promise<IProvider>;
  getSmartAccountProvider: (eoaProvider: IProvider) => Promise<SmartAccountClient>;
};

const isConnecting = new Map<string, boolean>();
// this is used to not initialize the login popup immediately when the connector is created,
// because wagmi config tries to call getProvider on all connectors
const isConnected = new Map<string, boolean>();

export const createWeb3AuthConnector = (
  parameters: Web3AuthConnectorParams & {
    accountAbstractionConfigs: (EvmAccountAbstractionModule & { chainId: number })[];
    icon?: string;
    whiteLabel?: Web3AuthNoModalConnectorConfig['whiteLabel'];
  },
) => {
  const { web3AuthInstance, loginParams, id, name, type, accountAbstractionConfigs, icon } =
    parameters;

  let eoaWalletProvider: IProvider | null = null;
  let smartAccountProvider: SmartAccountClient | null = null;

  return createConnector<SmartAccountClient>(config => ({
    id: id || 'web3auth',
    name: name || 'Web3Auth',
    type: type || 'Web3Auth',
    icon,
    async connect({ chainId } = {}) {
      if (isConnecting.get(id!)) {
        throw new Error('Already connecting');
      }
      isConnecting.set(id!, true);
      try {
        config.emitter.emit('message', {
          type: 'connecting',
        });

        const provider = await (this as SmartAccountConnector).getEoaProvider();

        provider.on('accountsChanged', this.onAccountsChanged);
        provider.on('chainChanged', this.onChainChanged);
        provider.on('disconnect', this.onDisconnect.bind(this));

        if (!web3AuthInstance.connected) {
          if (loginParams) {
            await web3AuthInstance.connectTo(WALLET_ADAPTERS.AUTH, loginParams);
          } else {
            console.error('please provide valid loginParams when using @web3auth/no-modal');
            throw new UserRejectedRequestError(
              'please provide valid loginParams when using @web3auth/no-modal' as unknown as Error,
            );
          }
        }

        let currentChainId = await this.getChainId();
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain!({ chainId }).catch(error => {
            if (error.code === UserRejectedRequestError.code) throw error;
            return { id: currentChainId };
          });
          currentChainId = chain?.id ?? currentChainId;
        }

        const accounts = await this.getAccounts();
        isConnected.set(id!, true);
        return { accounts, chainId: currentChainId };
      } catch (error) {
        console.error('error while connecting', error);
        this.onDisconnect();
        throw new UserRejectedRequestError('Something went wrong' as unknown as Error);
      } finally {
        isConnecting.set(id!, false);
      }
    },
    async getAccounts() {
      const scProvider = await (this as SmartAccountConnector).getSmartAccountProvider(
        await (this as SmartAccountConnector).getEoaProvider(),
      );
      if (!scProvider) {
        throw new Error('Smart Account Provider not found');
      }
      return [scProvider.account!.address];
    },
    async getChainId() {
      const provider = await (this as SmartAccountConnector).getEoaProvider();
      const chainId = await provider.request<unknown, number>({ method: 'eth_chainId' });
      return Number(chainId);
    },
    async getProvider(): Promise<SmartAccountClient> {
      if (isConnected.get(id!)) {
        return (this as SmartAccountConnector).getSmartAccountProvider(
          await (this as SmartAccountConnector).getEoaProvider(),
        );
      }
      return undefined as unknown as SmartAccountClient;
    },
    async getClient() {
      return this.getProvider();
    },
    async getEoaProvider() {
      if (eoaWalletProvider) {
        return eoaWalletProvider;
      }
      if (web3AuthInstance.status === ADAPTER_STATUS.NOT_READY) {
        if (loginParams) {
          await web3AuthInstance.init();
        } else {
          console.error('please provide valid loginParams when using @web3auth/no-modal');
          throw new UserRejectedRequestError(
            'please provide valid loginParams when using @web3auth/no-modal' as unknown as Error,
          );
        }
      }

      eoaWalletProvider = web3AuthInstance.provider!;
      return eoaWalletProvider;
    },
    async getSmartAccountProvider(eoaProvider: IProvider) {
      const currentChainId = await this.getChainId();

      // Check if we need to recreate the provider for a different chain
      if (smartAccountProvider && smartAccountProvider.chain?.id === currentChainId) {
        return smartAccountProvider;
      }

      const selectedChain = config.chains.find(x => x.id === currentChainId);
      if (!selectedChain) {
        throw new Error(`Chain ${currentChainId} not found`);
      }
      const publicClient = createPublicClient({
        chain: selectedChain,
        transport: http(config.transports?.[currentChainId]?.({}).value?.url),
      });

      const simpleSmartAccount = await toKernelSmartAccount({
        owners: [eoaProvider as EIP1193Provider],
        client: publicClient,
        entryPoint: {
          address: entryPoint07Address,
          version: '0.7',
        },
        index: 0n,
      });

      const accountAbstractionChainConfig = accountAbstractionConfigs.find(
        x => x.chainId === currentChainId,
      );

      if (!accountAbstractionChainConfig) {
        throw new Error(`Account abstraction module not found for chain ${currentChainId}`);
      }

      const paymasterClient = createPimlicoClient({
        transport: http(accountAbstractionChainConfig.paymasterUrl),
        entryPoint: {
          address: entryPoint07Address,
          version: '0.7',
        },
      });

      const smartAccountClient = createSmartAccountClient({
        bundlerTransport: http(accountAbstractionChainConfig.bundlerUrl),
        chain: selectedChain,
        account: simpleSmartAccount,
        paymaster: paymasterClient,
        userOperation: {
          estimateFeesPerGas: async () => (await paymasterClient.getUserOperationGasPrice()).fast,
        },
      });

      smartAccountProvider = smartAccountClient;

      return smartAccountClient;
    },
    async isAuthorized() {
      try {
        const accounts = await this.getAccounts();
        return !!accounts.length;
      } catch {
        return false;
      }
    },
    async switchChain({ chainId }): Promise<Chain> {
      try {
        const chain = config.chains.find(x => x.id === chainId);
        if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

        await web3AuthInstance.addChain({
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: `0x${chain.id.toString(16)}`,
          rpcTarget: chain.rpcUrls.default.http[0]!,
          displayName: chain.name,
          blockExplorerUrl: chain.blockExplorers?.default.url || '',
          ticker: chain.nativeCurrency?.symbol || 'ETH',
          tickerName: chain.nativeCurrency?.name || 'Ethereum',
          decimals: chain.nativeCurrency?.decimals || 18,
          logo: chain.nativeCurrency?.symbol
            ? `https://images.toruswallet.io/${chain.nativeCurrency?.symbol.toLowerCase()}.svg`
            : 'https://images.toruswallet.io/eth.svg',
        });
        console.info('Chain Added: ', chain.name);
        await web3AuthInstance.switchChain({ chainId: `0x${chain.id.toString(16)}` });
        console.info('Chain Switched to ', chain.name);
        config.emitter.emit('change', {
          chainId,
        });
        return chain;
      } catch (error: unknown) {
        console.error('Error: Cannot change chain', error);
        throw new SwitchChainError(error as Error);
      }
    },
    async disconnect(): Promise<void> {
      isConnected.set(id!, false);
      await web3AuthInstance.logout();
      const provider = await (this as SmartAccountConnector).getEoaProvider();
      provider.removeListener('accountsChanged', this.onAccountsChanged);
      provider.removeListener('chainChanged', this.onChainChanged);
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) config.emitter.emit('disconnect');
      else
        config.emitter.emit('change', {
          accounts: accounts.map(x => getAddress(x)),
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },
    onDisconnect(): void {
      config.emitter.emit('disconnect');
    },
  }));
};

'use client';

import { Button } from '@/components/ui/button';
import { useConnect, useDisconnect, useAccount, useBalance, useConfig, useChainId } from 'wagmi';
import { getWeb3AuthConnector } from '@/_fundset/settlement-layer/evm';
import { useReconnectWeb3Auth } from './useReconnectWeb3Auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { withClientOnly } from '@/components/utils/client-only';
import { useEvmChainConfigs } from '@/_fundset/settlement-layer/evm';

const EvmAuthComponentSkeleton = () => (
  <div className="flex flex-col items-center gap-2">
    <Skeleton className="h-6 w-[300px]" />
    <Skeleton className="h-9 w-[100px]" />
    <Skeleton className="h-6 w-[100px]" />
  </div>
);

const EvmAuthComponent = withClientOnly(
  () => {
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { status, address, connector } = useAccount();
    const config = useConfig();
    const chainId = useChainId();
    const { data: balance } = useBalance({
      address,
      query: {
        refetchInterval: 5000,
      },
    });
    const t = useTranslations('HomePage');

    const chainConfigs = useEvmChainConfigs();

    useReconnectWeb3Auth();

    if (status === 'connected') {
      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <div>{t('connected_with', { address, connector: connector.name })}</div>
          <Button variant="destructive" onClick={() => disconnect()}>
            {t('disconnect')}
          </Button>
          <div>Balance: {balance?.value}</div>
        </div>
      );
    }

    if (status === 'connecting' || status === 'reconnecting') {
      return <EvmAuthComponentSkeleton />;
    }

    return (
      <div className="flex flex-col gap-2">
        {chainConfigs
          .find(chainConfig => chainConfig.chainId === chainId)
          ?.modules.find(module => module.blockType === 'evm-aa-module')
          ?.providers.map(({ provider }) => (
            <Button
              key={provider}
              onClick={() =>
                connect({
                  connector: getWeb3AuthConnector({
                    wagmiConfig: config,
                    chainConfigs,
                    selectedChainId: chainId,
                    provider,
                  }),
                })
              }
            >
              {t('login_with', { connector: provider.charAt(0).toUpperCase() + provider.slice(1) })}
            </Button>
          ))}
        {connectors.map(connector => (
          <Button key={connector.id} onClick={() => connect({ connector })}>
            {t('login_with', { connector: connector.name })}
          </Button>
        ))}
      </div>
    );
  },
  () => <EvmAuthComponentSkeleton />,
);

export default EvmAuthComponent;

'use client';

import { useReconnectWeb3Auth } from './useReconnectWeb3Auth';
import { Skeleton } from '@/components/ui/skeleton';
import { withClientOnly } from '@/components/utils/client-only';
import { ConnectWalletButton } from './components/simplekit';

const EvmAuthComponentSkeleton = () => (
  <div className="flex flex-col items-center gap-2">
    <Skeleton className="h-9 w-[100px]" />
  </div>
);

const EvmAuthComponent = withClientOnly(
  () => {
    useReconnectWeb3Auth();

    return <ConnectWalletButton />;
  },
  () => <EvmAuthComponentSkeleton />,
);

export default EvmAuthComponent;

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { withClientOnly } from '@/components/utils/client-only';
import { ConnectWalletButton } from './components/simplekit';
import { useSwitchChainIfSelectedIsNotConfigured } from './useSwitchChainIfSelectedIsNotConfigured';

const EvmAuthComponentSkeleton = () => (
  <div className="flex flex-col items-center gap-2">
    <Skeleton className="h-9 w-[100px]" />
  </div>
);

const EvmAuthComponent = withClientOnly(
  () => {
    useSwitchChainIfSelectedIsNotConfigured();

    return <ConnectWalletButton />;
  },
  () => <EvmAuthComponentSkeleton />,
);

export default EvmAuthComponent;

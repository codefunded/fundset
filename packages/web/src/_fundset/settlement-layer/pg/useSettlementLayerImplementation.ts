import { SettlementLayer } from 'fundset/settlement-layer';
import { useMemo } from 'react';
import { authClient } from '@/lib/auth-client';
import { buildCounterModule } from './modules/counter';

export const usePgSettlementLayer = () => {
  const { data: session } = authClient.useSession();
  const pgSettlementLayer: SettlementLayer = useMemo(() => {
    return {
      name: 'pg',
      ...buildCounterModule({ session }),
    };
  }, [session]);
  return pgSettlementLayer;
};

export default usePgSettlementLayer;

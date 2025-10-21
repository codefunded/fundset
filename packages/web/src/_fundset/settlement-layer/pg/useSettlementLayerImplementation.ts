import { SettlementLayer } from 'fundset/settlement-layer';
import { useMemo } from 'react';
import { authClient } from '@/lib/auth-client';
import { buildPgSettlementLayer } from './buildSettlementLayer';

export const usePgSettlementLayer = () => {
  const { data: session } = authClient.useSession();
  const pgSettlementLayer: SettlementLayer = useMemo(() => {
    return buildPgSettlementLayer({ session }).pgSettlementLayer;
  }, [session]);
  return pgSettlementLayer;
};

export default usePgSettlementLayer;

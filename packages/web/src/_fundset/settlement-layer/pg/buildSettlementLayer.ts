import type { authClient } from '@/lib/auth-client';
import { buildCounterModule } from '../modules/counter/pg/build';

export const buildPgSettlementLayer = ({
  session,
}: {
  session: ReturnType<typeof authClient.useSession>['data'];
}) => {
  const pgSettlementLayer = {
    name: 'pg',
    ...buildCounterModule({ session }),
  };
  return { pgSettlementLayer };
};

export default buildPgSettlementLayer;

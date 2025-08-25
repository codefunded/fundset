import { FundsetSettlementLayer } from '@/payload-types';

export type SettlementLayerConfig = NonNullable<FundsetSettlementLayer['settlementLayer']>[number];

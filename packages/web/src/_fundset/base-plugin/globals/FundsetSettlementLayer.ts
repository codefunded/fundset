import { revalidateTag } from 'next/cache';
import type { GlobalConfig } from 'payload';

export const FundsetSettlementLayer: GlobalConfig = {
  slug: 'fundset-settlement-layer',
  fields: [
    {
      name: 'settlementLayer',
      type: 'blocks',
      blocks: [],
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        revalidateTag('settlement-layer-config');
      },
    ],
  },
};

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import payloadConfig from '@/payload.config';
import { getPayload } from 'payload';

export const getSettlementLayerConfig = unstable_cache(
  cache(async () => {
    const payload = await getPayload({
      config: payloadConfig,
    });
    const [theme, { settlementLayer: settlementLayerConfigs }] = await Promise.all([
      payload.findGlobal({
        slug: 'theme',
      }),
      payload.findGlobal({
        slug: 'fundset-settlement-layer',
      }),
    ]);

    const settlementLayerConfig = settlementLayerConfigs?.at(0);

    if (!settlementLayerConfig) {
      throw new Error(
        'Settlement layer not found. Please add a settlement layer in CMS via /admin page.',
      );
    }

    return {
      theme,
      settlementLayerConfig,
      settlementLayerConfigs: settlementLayerConfigs ?? [],
    };
  }),
  ['settlement-layer-config'],
  {
    tags: ['settlement-layer-config'],
  },
);

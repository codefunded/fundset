import type { Config, PayloadRequest } from 'payload';
import { EvmSettlementLayer } from './blocks/EvmSettlementLayer';
import { seed } from './seed';

export const evmSettlementLayerPlugin =
  () =>
  (config: Config): Config => {
    config.globals ??= [];

    // append the postgres option to the settlement layer type field
    const fundsetSettlementLayer = config.globals.find(g => g.slug === 'fundset-settlement-layer');

    if (!fundsetSettlementLayer) {
      throw new Error(
        'fundsetSettlementLayer not found, run fundsetBasePlugin before postgresSettlementLayerPlugin',
      );
    }

    const settlementLayerTypeField = fundsetSettlementLayer.fields.find(
      f => f.type === 'blocks' && f.name === 'settlementLayer',
    )!;

    if (settlementLayerTypeField.type === 'blocks') {
      settlementLayerTypeField.blocks.push(EvmSettlementLayer);
    }

    config.endpoints ??= [];

    if (process.env.NODE_ENV === 'development') {
      config.endpoints.push({
        path: '/evm/hot-contract-reload',
        method: 'post',
        handler: async (req: PayloadRequest) => {
          const deployedContracts = await req.json?.();
          await seed(req.payload, deployedContracts, true);
          return new Response(JSON.stringify({ message: 'OK' }));
        },
      });
    }

    const defaultOnInit = config.onInit;

    config.onInit = async payload => {
      await defaultOnInit?.(payload);

      const { evmSettlementLayerEnv } = await import('@/_fundset/settlement-layer/evm/env');
      evmSettlementLayerEnv();

      if (process.env.NODE_ENV === 'development') {
        await seed(payload);
      }
    };

    return config;
  };

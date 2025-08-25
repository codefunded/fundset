import type { Config } from 'payload';
import { PgSettlementLayer } from './blocks/PostgresSettlementLayer';
import { spawn } from 'node:child_process';

export const pgSettlementLayerPlugin =
  () =>
  (config: Config): Config => {
    config.globals ??= [];
    config.collections ??= [];

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
      settlementLayerTypeField.blocks.push(PgSettlementLayer);
    }

    const defaultOnInit = config.onInit;

    config.onInit = async payload => {
      await defaultOnInit?.(payload);

      const { pgSettlementLayerEnv } = await import('@/_fundset/settlement-layer/pg/plugin/env');
      pgSettlementLayerEnv();

      if (process.env.NODE_ENV === 'development') {
        const fundsetSettlementLayer = await payload.findGlobal({
          slug: 'fundset-settlement-layer',
        });

        const settlementLayerConfigs = fundsetSettlementLayer.settlementLayer ?? [];

        await payload.updateGlobal({
          slug: 'fundset-settlement-layer',
          data: {
            settlementLayer: settlementLayerConfigs
              .concat([
                {
                  type: 'pg',
                  blockType: 'pg-settlement-layer',
                },
              ])
              .toReversed(),
          },
        });

        await new Promise(resolve =>
          spawn('pnpm', ['drizzle-kit', 'generate'], { stdio: 'inherit' }).on('close', resolve),
        );
        await new Promise(resolve =>
          spawn('pnpm', ['drizzle-kit', 'migrate'], { stdio: 'inherit' }).on('close', resolve),
        );
      }
    };

    return config;
  };

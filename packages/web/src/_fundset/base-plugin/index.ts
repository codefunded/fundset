import type { Config } from 'payload';
import { FundsetSettlementLayer } from './globals/FundsetSettlementLayer';
import { Theme } from './globals/Theme';
import { seed } from './seed';

export const fundsetBasePlugin =
  () =>
  (config: Config): Config => {
    config.globals ??= [];

    config.globals.push(FundsetSettlementLayer);
    config.globals.push(Theme);

    const defaultOnInit = config.onInit;

    config.onInit = async payload => {
      await defaultOnInit?.(payload);

      if (process.env.NODE_ENV === 'development') {
        await seed(payload);
      }
    };

    return config;
  };

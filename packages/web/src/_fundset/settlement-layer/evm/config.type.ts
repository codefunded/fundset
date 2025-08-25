import { FundsetSettlementLayer } from '@/payload-types';

export type EvmSettlementLayerConfig = Extract<
  NonNullable<FundsetSettlementLayer['settlementLayer']>[number],
  { type: 'evm' }
>;

export type EvmModule = {
  proxyAddress: string;
  contracts: EvmContracts;
};

export type EvmChainModules = Record<number, EvmModule>;

type ModulesWithContracts = Extract<
  EvmSettlementLayerConfig['chainConfigs'][number]['modules'][number],
  { contracts: object }
>;

export type EvmContracts = ModulesWithContracts extends infer M
  ? M extends { contracts: infer C }
    ? C extends Array<infer T>
      ? Omit<T, 'id'>
      : never
    : never
  : never;

export type EvmAccountAbstractionModule = Extract<
  EvmSettlementLayerConfig['chainConfigs'][number]['modules'][number],
  { blockType: 'evm-aa-module' }
>;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export type EvmContracts = UnionToIntersection<
  ModulesWithContracts extends infer M
    ? M extends { contracts: infer C }
      ? C extends Array<infer T>
        ? Omit<T, 'id'>
        : never
      : never
    : never
>;

export type EvmAccountAbstractionModule = Extract<
  EvmSettlementLayerConfig['chainConfigs'][number]['modules'][number],
  { blockType: 'evm-aa-module' }
>;

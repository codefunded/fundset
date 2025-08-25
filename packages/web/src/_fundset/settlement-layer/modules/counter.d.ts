import { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReturnValue = any;

export interface CounterModule {
  isIncrementGlobalCounterReady: boolean;
  incrementGlobalCounterMutationOptions: UseMutationOptions<AnyReturnValue, Error, number>;
  globalCounterValueQueryOptions: UseQueryOptions<unknown, Error, number | undefined, QueryKey>;

  isIncrementPersonalCounterReady: boolean;
  incrementPersonalCounterMutationOptions: UseMutationOptions<AnyReturnValue, Error, number>;
  personalCounterValueQueryOptions: UseQueryOptions<unknown, Error, number | undefined, QueryKey>;
}

declare module 'fundset/settlement-layer' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface SettlementLayer extends CounterModule {}
}

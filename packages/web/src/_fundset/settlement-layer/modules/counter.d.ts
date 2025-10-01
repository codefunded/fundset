import { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

export type GlobalCounterIncrementEvent = {
  amount: number;
  timestamp: Date;
  by: number;
  id: string;
};

export interface CounterModule {
  counter: {
    isIncrementGlobalCounterReady: boolean;
    incrementGlobalCounterMutationOptions: () => UseMutationOptions<void, Error, number>;
    globalCounterValueQueryOptions: () => UseQueryOptions<
      unknown,
      Error,
      number | undefined,
      QueryKey
    >;
    globalCounterIncrementEventsQueryOptions: ({
      limit,
      offset,
    }: {
      limit: number;
      offset: number;
    }) => UseQueryOptions<unknown, Error, GlobalCounterIncrementEvent[], QueryKey>;

    isIncrementPersonalCounterReady: boolean;
    incrementPersonalCounterMutationOptions: () => UseMutationOptions<void, Error, number>;
    personalCounterValueQueryOptions: () => UseQueryOptions<
      unknown,
      Error,
      number | undefined,
      QueryKey
    >;
  };
}

declare module 'fundset/settlement-layer' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface SettlementLayer extends CounterModule {}
}

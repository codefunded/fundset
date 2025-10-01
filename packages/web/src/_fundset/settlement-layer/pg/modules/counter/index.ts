import { CounterModule } from '@/_fundset/settlement-layer/modules/counter';
import { oRPCQueryUtils } from '../../orpc/client';
import { authClient } from '@/lib/auth-client';

export const buildCounterModule = ({
  session,
}: {
  session: ReturnType<typeof authClient.useSession>['data'];
}) => {
  return {
    counter: {
      isIncrementGlobalCounterReady: true,
      incrementGlobalCounterMutationOptions: () =>
        oRPCQueryUtils.globalCounter.increment.mutationOptions({
          meta: {
            invalidatesQueries: [oRPCQueryUtils.globalCounter.get.queryOptions().queryKey],
          },
        }),
      globalCounterValueQueryOptions: () => oRPCQueryUtils.globalCounter.get.queryOptions(),

      isIncrementPersonalCounterReady: !!session?.user.id,
      incrementPersonalCounterMutationOptions: () =>
        oRPCQueryUtils.personalCounter.increment.mutationOptions({
          meta: {
            invalidatesQueries: [
              oRPCQueryUtils.personalCounter.get.queryOptions({
                input: {
                  userId: session?.user.id,
                },
              }).queryKey,
            ],
          },
        }),
      personalCounterValueQueryOptions: () =>
        oRPCQueryUtils.personalCounter.get.queryOptions({
          input: {
            userId: session?.user.id,
          },
        }),
      globalCounterIncrementEventsQueryOptions: ({ limit, offset }) =>
        oRPCQueryUtils.globalCounter.getEvents.queryOptions({
          input: {
            limit,
            offset,
          },
        }),
    },
  } satisfies CounterModule;
};

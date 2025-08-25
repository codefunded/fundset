import { CounterModule } from '@/_fundset/settlement-layer/modules/counter';
import { oRPCQueryUtils } from '../../orpc/client';
import { authClient } from '@/lib/auth-client';

export const buildCounterModule = ({
  session,
}: {
  session: ReturnType<typeof authClient.useSession>['data'];
}) => {
  return {
    isIncrementGlobalCounterReady: true,
    incrementGlobalCounterMutationOptions: oRPCQueryUtils.globalCounter.increment.mutationOptions({
      meta: {
        invalidatesQuery: oRPCQueryUtils.globalCounter.get.queryOptions().queryKey,
      },
    }),
    globalCounterValueQueryOptions: oRPCQueryUtils.globalCounter.get.queryOptions(),

    isIncrementPersonalCounterReady: !!session?.user.id,
    incrementPersonalCounterMutationOptions:
      oRPCQueryUtils.personalCounter.increment.mutationOptions({
        meta: {
          invalidatesQuery: oRPCQueryUtils.personalCounter.get.queryOptions({
            input: {
              userId: session?.user.id,
            },
          }).queryKey,
        },
      }),
    personalCounterValueQueryOptions: oRPCQueryUtils.personalCounter.get.queryOptions({
      input: {
        userId: session?.user.id,
      },
    }),
  } satisfies CounterModule;
};

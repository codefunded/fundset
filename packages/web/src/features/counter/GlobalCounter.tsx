import { LoadingButton } from '@/components/ui/action-button';
import { useSettlementLayer } from '@/_fundset/settlement-layer/provider';
import { useTranslations } from 'next-intl';
import { ErrorAlert } from '../errors/ErrorAlert';
import posthog from 'posthog-js';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery } from '@tanstack/react-query';

export const GlobalCounter = () => {
  const t = useTranslations('HomePage');
  const tErrors = useTranslations('Errors');

  const {
    isIncrementGlobalCounterReady,
    incrementGlobalCounterMutationOptions,
    globalCounterValueQueryOptions,
  } = useSettlementLayer();
  const { data: counterValue, isLoading } = useQuery(globalCounterValueQueryOptions);
  const {
    mutateAsync: incrementCounter,
    isSuccess,
    isPending,
    error,
    isError,
  } = useMutation(incrementGlobalCounterMutationOptions);

  const [incrementAmount, setIncrementAmount] = useState(1);

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-6 w-[32px]" />
      ) : (
        <div>
          {t('global_counter_value')}: {counterValue?.toString()}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={incrementAmount}
          onChange={e => setIncrementAmount(Number(e.target.value))}
        />
        <LoadingButton
          disabled={isPending || !isIncrementGlobalCounterReady}
          loading={isPending}
          success={isSuccess}
          onClick={async () => {
            posthog.capture('increment_global_counter');
            await incrementCounter(incrementAmount);
          }}
        >
          {t('increment')}
        </LoadingButton>
      </div>
      {isError && (
        <ErrorAlert error={error} title={tErrors('cannot_increment')} className="max-w-fit" />
      )}
    </>
  );
};

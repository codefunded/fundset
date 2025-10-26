import { LoadingButton } from '@/components/ui/action-button';
import { useSettlementLayer } from '@/_fundset/settlement-layer';
import { useTranslations } from 'next-intl';
import { ErrorAlert } from '../errors/ErrorAlert';
import posthog from 'posthog-js';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

export const PersonalCounter = () => {
  const t = useTranslations('HomePage');
  const tErrors = useTranslations('Errors');

  const {
    counter: {
      isIncrementPersonalCounterReady,
      incrementPersonalCounterMutationOptions,
      personalCounterValueQueryOptions,
    },
  } = useSettlementLayer();
  const { data: counterValue, isLoading } = useQuery(personalCounterValueQueryOptions());
  const {
    mutateAsync: incrementCounter,
    isSuccess,
    isPending,
    error,
    isError,
  } = useMutation(incrementPersonalCounterMutationOptions());

  const [incrementAmount, setIncrementAmount] = useState(1);

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-6 w-[32px]" />
      ) : (
        <div>
          {t('personal_counter_value')}: {counterValue?.toString()}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={incrementAmount}
          onChange={e => setIncrementAmount(Number(e.target.value))}
        />
        <LoadingButton
          disabled={isPending || !isIncrementPersonalCounterReady}
          loading={isPending}
          success={isSuccess}
          onClick={async () => {
            posthog.capture('increment_personal_counter');
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

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSettlementLayer } from '@/_fundset/settlement-layer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export const IncrementHistory = () => {
  const {
    counter: { globalCounterIncrementEventsQueryOptions },
  } = useSettlementLayer();
  const [offset, setOffset] = useState(0);
  const t = useTranslations('HomePage');

  const handleFetchPreviousPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleFetchNextPage = () => {
    setOffset(offset + limit);
  };

  const limit = 3;
  const {
    data: events = [],
    isLoading,
    isFetching,
  } = useQuery({
    ...globalCounterIncrementEventsQueryOptions({ limit, offset }),
    placeholderData: keepPreviousData,
  });

  const currentPage = offset / limit + 1;
  const hasPreviousPage = offset > 0;
  const hasNextPage = events?.length === limit;
  const isFetchingPreviousPage = isFetching;
  const isFetchingNextPage = isFetching;

  return (
    <Card className="mt-16">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          {t('increment_history')}
        </CardTitle>
        <CardDescription>{t('recent_increment_history')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div>
                    <div className="font-medium">#{event.id}</div>
                    <div className="text-muted-foreground text-sm">
                      {event.timestamp.toLocaleDateString()} at{' '}
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div>
                  <div className="text-muted-foreground">ID</div>
                  <div className="font-mono text-xs">{event.id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Incremented by</div>
                  <div className="font-medium">{event.by}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">New amount</div>
                  <div className="font-medium">{event.amount}</div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-33 w-full" />
              <Skeleton className="h-33 w-full" />
              <Skeleton className="h-33 w-full" />
            </div>
          )}

          {events.length === 0 && !isLoading && (
            <div className="text-muted-foreground py-8 text-center">
              {t('no_increment_history_available')}
            </div>
          )}
        </div>

        {
          <div className="mt-6 flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0 md:space-x-4">
            <div className="text-muted-foreground text-sm">
              {t('page')} {currentPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchPreviousPage}
                disabled={!hasPreviousPage || isFetchingPreviousPage}
              >
                {isFetchingPreviousPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchNextPage}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {t('next')}
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        }
      </CardContent>
    </Card>
  );
};

export default IncrementHistory;

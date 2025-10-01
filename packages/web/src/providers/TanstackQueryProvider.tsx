'use client';

import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidatesQueries: QueryKey;
    };
  }
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    async onSettled(_data, _error, _variables, _context, mutation) {
      if (mutation.meta?.invalidatesQueries) {
        for (const queryKey of mutation.meta.invalidatesQueries) {
          await queryClient.invalidateQueries({ queryKey: queryKey as QueryKey });
        }
      }
    },
  }),
});

export const TanstackQueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools buttonPosition="bottom-right" initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

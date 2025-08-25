'use client';

import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidatesQuery: QueryKey;
    };
  }
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    async onSettled(_data, _error, _variables, _context, mutation) {
      if (mutation.meta?.invalidatesQuery) {
        await queryClient.invalidateQueries({ queryKey: mutation.meta.invalidatesQuery });
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

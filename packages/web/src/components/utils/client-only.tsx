/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

type ClientOnlyProps = {
  children: React.JSX.Element | React.JSX.Element[] | React.ReactNode;
} & Parameters<typeof Suspense>[0];

const ClientOnly = (props: ClientOnlyProps) => {
  const { children } = props;

  return children;
};

export const createClientOnlyWithLoading = (loading: () => React.ReactNode) =>
  dynamic(() => Promise.resolve(ClientOnly), {
    ssr: false,
    loading,
  });

export const withClientOnly = (
  Component: React.ComponentType<any>,
  loading?: () => React.ReactNode,
) => {
  const ClientOnly = createClientOnlyWithLoading(loading ?? (() => null));
  const WrappedComponent = (props: any) => (
    <ClientOnly>
      <Component {...props} />
    </ClientOnly>
  );

  return WrappedComponent;
};

export default dynamic(() => Promise.resolve(ClientOnly), {
  ssr: false,
});

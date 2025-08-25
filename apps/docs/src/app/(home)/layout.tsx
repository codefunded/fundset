import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      links={[
        ...(baseOptions.links || []),
        {
          type: 'main',
          on: 'nav',
          text: 'Documentation',
          url: '/docs',
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}

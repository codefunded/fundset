import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { CodefundedLogo } from './codefunded-logo';
import { Manrope } from 'next/font/google';
import { cn } from 'fumadocs-ui/utils/cn';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex items-center gap-2">
        <CodefundedLogo className="h-5 w-5" />
        <div className={cn(manrope.className)}>fundset</div>
      </div>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [],
};

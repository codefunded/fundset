'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('ErrorPage');
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="relative z-10 max-w-2xl text-center">
        <h1 className="mt-6 text-4xl !leading-[1.2] font-bold tracking-tight sm:text-5xl md:text-6xl">
          {t('something_went_wrong')}
        </h1>
        <p className="mt-6 text-[17px] md:text-lg">{t('description')}</p>
        <code className="text-sm">{error.message ?? 'unknown'}</code>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button size="lg" className="text-base" onClick={() => reset()}>
            Reload <RotateCcw className="!h-5 !w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

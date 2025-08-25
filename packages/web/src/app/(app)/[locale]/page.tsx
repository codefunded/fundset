import { LocaleToggle } from '@/components/ui/locale-toggle';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import AuthComponent from '@/features/auth/auth-component';
import { getTranslations } from 'next-intl/server';
import Example from '@/features/landing/Example';
import { getSettlementLayerConfig } from '@/_fundset/config/getSettlementLayerConfig';

export default async function Home() {
  const t = await getTranslations('HomePage');
  const { settlementLayerConfig } = await getSettlementLayerConfig();

  return (
    <div className="flex min-h-screen flex-col gap-4">
      <div className="flex justify-end gap-4 p-4">
        <ThemeToggle />
        <LocaleToggle />
      </div>
      <div className="flex grow flex-col items-center justify-center gap-16 p-8 pb-20 sm:p-20">
        <h1>{t('title')}</h1>
        <AuthComponent settlementLayerName={settlementLayerConfig.type} />

        <Example />
      </div>
    </div>
  );
}

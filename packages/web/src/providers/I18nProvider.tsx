import { Locale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function I18nProvider({
  children,
  locale,
}: React.PropsWithChildren<{ locale: Locale }>) {
  const messages = await getMessages({ locale });
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}

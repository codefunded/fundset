import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const ErrorAlert = ({
  error,
  title,
  className,
}: {
  error: Error | null;
  title: string;
  className?: string;
}) => {
  const t = useTranslations('Errors');

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{error && t(error.message as Parameters<typeof t>[0])}</p>
      </AlertDescription>
    </Alert>
  );
};

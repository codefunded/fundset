import { Button } from '@/components/ui/button';
import Script from 'next/script';

export const ThemeEditor = () => {
  return (
    <>
      <Script src="https://unpkg.com/@styleglide/theme-editor" />
      <div className="fixed bottom-3 left-15 z-50 p-2">
        <Button data-theme-editor-open variant="outline">
          Theme
        </Button>
      </div>
    </>
  );
};

'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, localeNames } from '@/i18n/config';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locales.find((l) => l !== locale)!;

  function handleSwitch() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      className="px-2 py-1 text-xs rounded border border-border-default text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors font-mono"
      title={`Switch to ${localeNames[otherLocale]}`}
    >
      🌐 {localeNames[otherLocale]}
    </button>
  );
}

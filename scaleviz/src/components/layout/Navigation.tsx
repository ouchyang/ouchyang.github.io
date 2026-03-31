'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navigation() {
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-50 border-b border-border-light/50 bg-bg-primary/80 backdrop-blur-xl">
      <nav className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-7 h-7 rounded-lg bg-text-primary flex items-center justify-center text-bg-primary text-xs font-bold font-mono transition-opacity group-hover:opacity-80">
            S
          </span>
          <span className="font-semibold text-base tracking-tight">ScaleViz</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/about"
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
          >
            {t('about')}
          </Link>
          <div className="w-px h-4 bg-border-default mx-1.5" />
          <ThemeToggle />
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
}

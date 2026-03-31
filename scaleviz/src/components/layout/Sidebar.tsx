'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LAYERS } from '@/lib/layers';

export function Sidebar() {
  const t = useTranslations('layers');
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <aside className="hidden lg:block w-52 shrink-0 border-r border-border-default sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3">
      <nav className="space-y-1">
        {LAYERS.map((layer) => {
          const href = `/topics/${layer.dirName}`;
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={layer.id}
              href={href}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-border-default text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-border-light'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: layer.color }}
              />
              <span className="font-mono text-xs" style={{ color: isActive ? layer.color : undefined }}>
                {layer.id}
              </span>
              <span className="truncate text-xs">
                {t(layer.id)}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

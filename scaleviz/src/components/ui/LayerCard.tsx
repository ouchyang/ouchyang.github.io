'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { LayerInfo } from '@/lib/layers';
import type { ArticleMeta } from '@/lib/content/articles';

interface LayerCardProps {
  layer: LayerInfo;
  articles?: ArticleMeta[];
}

export function LayerCard({ layer, articles = [] }: LayerCardProps) {
  const t = useTranslations('layers');
  const hasArticles = articles.length > 0;

  return (
    <div className="group rounded-2xl border border-border-light bg-bg-secondary/40 hover:bg-bg-secondary/80 hover:border-border-default transition-all duration-200 overflow-hidden hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-black/[0.12]">
      {/* Color accent strip */}
      <div className="h-[3px]" style={{ background: layer.color }} />

      <div className="p-5">
        {/* Header — links to layer page */}
        <Link href={`/topics/${layer.dirName}`} className="block mb-3">
          <div className="flex items-center gap-3 mb-2.5">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-bold font-mono text-white shrink-0"
              style={{ background: layer.color }}
            >
              {layer.num}
            </span>
            <h3 className="font-semibold text-[15px] leading-snug group-hover:opacity-80 transition-opacity">
              {t(layer.id)}
            </h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
            {layer.descZh}
          </p>
        </Link>

        {/* Article links */}
        {hasArticles && (
          <div className="mt-4 pt-3 border-t border-border-light space-y-1.5">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/topics/${layer.dirName}/${article.slug}`}
                className="flex items-center gap-2 py-0.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 opacity-60"
                  style={{ background: layer.color }}
                />
                <span className="truncate">{article.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

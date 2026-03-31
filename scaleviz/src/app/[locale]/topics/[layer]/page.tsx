import { notFound } from 'next/navigation';
import { LAYERS } from '@/lib/layers';
import { getArticlesForLayer } from '@/lib/content/articles';
import { Link } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string; layer: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    LAYERS.map((layer) => ({ locale, layer: layer.dirName }))
  );
}

export default async function LayerPage({ params }: Props) {
  const { locale, layer: layerDir } = await params;
  setRequestLocale(locale);
  const layerInfo = LAYERS.find((l) => l.dirName === layerDir);
  if (!layerInfo) notFound();

  const articles = await getArticlesForLayer(locale, layerDir);

  return (
    <div className="px-6 py-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <span
          className="w-4 h-4 rounded-full"
          style={{ background: layerInfo.color }}
        />
        <h1 className="text-3xl font-bold font-mono" style={{ color: layerInfo.color }}>
          {layerInfo.id} — {layerInfo.nameZh}
        </h1>
      </div>

      {articles.length === 0 ? (
        <p className="text-text-secondary">暂无内容，敬请期待...</p>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/topics/${layerDir}/${article.slug}`}
              className="block p-4 rounded-lg border border-border-default hover:border-text-muted/30 bg-bg-secondary transition-colors"
            >
              <h2 className="font-semibold">{article.title}</h2>
              {article.description && (
                <p className="text-text-secondary text-sm mt-1">{article.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

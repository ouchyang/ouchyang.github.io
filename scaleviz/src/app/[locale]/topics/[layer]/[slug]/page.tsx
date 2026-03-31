import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticlesForLayer } from '@/lib/content/articles';
import { MDXRenderer } from '@/components/mdx/MDXRenderer';
import { LAYERS } from '@/lib/layers';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string; layer: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; layer: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const layer of LAYERS) {
      const articles = await getArticlesForLayer(locale, layer.dirName);
      for (const article of articles) {
        params.push({ locale, layer: layer.dirName, slug: article.slug });
      }
    }
  }
  return params;
}

export default async function ArticlePage({ params }: Props) {
  const { locale, layer: layerDir, slug } = await params;
  setRequestLocale(locale);
  const layerInfo = LAYERS.find((l) => l.dirName === layerDir);
  if (!layerInfo) notFound();

  const article = await getArticleBySlug(locale, layerDir, slug);
  if (!article) notFound();

  return (
    <article className="px-6 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: layerInfo.color }}
          />
          <span style={{ color: layerInfo.color }}>{layerInfo.id}</span>
          <span>·</span>
          <span>{layerInfo.nameZh}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {article.frontmatter.title}
        </h1>
        {article.frontmatter.description && (
          <p className="text-text-secondary text-lg">
            {article.frontmatter.description}
          </p>
        )}
      </header>

      {/* Content */}
      <div className="prose-scaleviz">
        <MDXRenderer source={article.content} />
      </div>
    </article>
  );
}

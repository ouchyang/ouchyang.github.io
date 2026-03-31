import { useTranslations } from 'next-intl';
import { LayerCard } from '@/components/ui/LayerCard';
import { LAYERS } from '@/lib/layers';
import { getArticlesForLayer, type ArticleMeta } from '@/lib/content/articles';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const layerArticles: Record<string, ArticleMeta[]> = {};
  await Promise.all(
    LAYERS.map(async (layer) => {
      layerArticles[layer.dirName] = await getArticlesForLayer(locale, layer.dirName);
    })
  );

  return (
    <div>
      <HeroSection />

      {/* 9-Layer Architecture Grid */}
      <LayerGridSection layerArticles={layerArticles} />
    </div>
  );
}

function HeroSection() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations();
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-36 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-secondary/80 border border-border-light text-xs text-text-secondary mb-10 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-layer-6" />
          9-Layer Architecture
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('home.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-4 leading-relaxed">
          {t('home.subtitle')}
        </p>

        {/* Tagline */}
        <p className="text-text-muted italic text-sm mb-12 font-mono">
          &quot;{t('home.tagline')}&quot;
        </p>

        {/* CTA */}
        <a
          href="#layers"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-text-primary text-bg-primary font-medium text-sm hover:opacity-90 transition-all"
        >
          {t('home.explore')}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3v10M4 9l4 4 4-4" />
          </svg>
        </a>
      </div>

      {/* Decorative background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[400px] rounded-full bg-layer-5/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] rounded-full bg-layer-6/[0.04] blur-[120px]" />
      </div>
    </section>
  );
}

function LayerGridSection({ layerArticles }: { layerArticles: Record<string, ArticleMeta[]> }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations();
  return (
    <section id="layers" className="max-w-6xl mx-auto px-6 pb-28">
      {/* Section header */}
      <div className="text-center mb-14">
        <h2
          className="text-2xl md:text-3xl font-bold tracking-tight mb-3"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('home.sectionTitle')}
        </h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto leading-relaxed">
          {t('home.sectionDesc')}
        </p>
      </div>

      {/* 3×3 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {LAYERS.map((layer) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            articles={layerArticles[layer.dirName] || []}
          />
        ))}
      </div>
    </section>
  );
}

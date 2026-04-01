import type { MetadataRoute } from 'next';
import { LAYERS } from '@/lib/layers';
import { getArticlesForLayer } from '@/lib/content/articles';
import { locales } from '@/i18n/config';

export const dynamic = 'force-static';

const BASE_URL = 'https://ouchyang.github.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Home pages
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    });
  }

  // Layer listing pages
  for (const locale of locales) {
    for (const layer of LAYERS) {
      entries.push({
        url: `${BASE_URL}/${locale}/topics/${layer.dirName}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Article pages
  for (const locale of locales) {
    for (const layer of LAYERS) {
      const articles = await getArticlesForLayer(locale, layer.dirName);
      for (const article of articles) {
        entries.push({
          url: `${BASE_URL}/${locale}/topics/${layer.dirName}/${article.slug}`,
          lastModified: article.date ? new Date(article.date) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
